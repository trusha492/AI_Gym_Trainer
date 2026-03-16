from typing import List
from datetime import date
import json
import base64
import re
import logging
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from groq import Groq

from app.database.session import get_db
from app.models.user import User
from app.models.chat_history import ChatHistory
from app.models.nutrition import NutritionEntry
from app.models.profile import Profile
from app.models.workout_log import WorkoutLog
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.services.nutrition_logging import save_calorie_log, save_weight_log


router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
client = Groq(api_key=settings.GROQ_API_KEY)
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    message: str
    preferred_language: str | None = None


def _extract_log_json_and_reply(ai_text: str):
    token = "LOG_JSON:"
    idx = ai_text.find(token)
    if idx == -1:
        return ai_text.strip(), None

    clean_reply = ai_text[:idx].rstrip()
    raw_tail = ai_text[idx + len(token) :].strip()
    start = raw_tail.find("{")
    if start == -1:
        return clean_reply, None

    brace_depth = 0
    in_string = False
    escaped = False
    end = -1

    for i, ch in enumerate(raw_tail[start:], start=start):
        if escaped:
            escaped = False
            continue
        if ch == "\\" and in_string:
            escaped = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            brace_depth += 1
        elif ch == "}":
            brace_depth -= 1
            if brace_depth == 0:
                end = i
                break

    if end == -1:
        return clean_reply, None

    try:
        parsed = json.loads(raw_tail[start : end + 1])
    except json.JSONDecodeError:
        parsed = None

    return clean_reply, parsed


def _apply_logs_from_json(log_json: dict | None, db: Session, user_id: int) -> bool:
    dashboard_updated = False
    if not log_json:
        return dashboard_updated

    log_date_str = log_json.get("log_date")
    try:
        log_date = date.fromisoformat(log_date_str) if log_date_str else date.today()
    except ValueError:
        log_date = date.today()

    if log_json.get("weight_kg") is not None:
        save_weight_log(
            db=db,
            user_id=user_id,
            weight_kg=log_json["weight_kg"],
            log_date=log_date,
        )
        dashboard_updated = True

    if log_json.get("calories") is not None:
        save_calorie_log(
            db=db,
            user_id=user_id,
            calories_consumed=log_json["calories"],
            calories_target=log_json.get("calories_target"),
            protein_g=log_json.get("protein_g"),
            carbs_g=log_json.get("carbs_g"),
            fats_g=log_json.get("fats_g"),
            log_date=log_date,
        )
        dashboard_updated = True

    workouts_done = log_json.get("workouts_done")
    if workouts_done is not None:
        try:
            workouts_done = max(0, int(workouts_done))
        except (TypeError, ValueError):
            workouts_done = None
    if workouts_done is not None:
        log_date_str = log_json.get("log_date")
        try:
            workout_log_date = date.fromisoformat(log_date_str) if log_date_str else date.today()
        except ValueError:
            workout_log_date = date.today()

        existing = (
            db.query(WorkoutLog)
            .filter(
                WorkoutLog.user_id == user_id,
                WorkoutLog.log_date == workout_log_date,
            )
            .first()
        )
        if existing:
            existing.workouts_done = workouts_done
        else:
            db.add(
                WorkoutLog(
                    user_id=user_id,
                    log_date=workout_log_date,
                    workouts_done=workouts_done,
                )
            )
        dashboard_updated = True

    return dashboard_updated


def _extract_calorie_fallback(message: str) -> dict:
    text = (message or "").lower()

    calories = None
    calories_target = None

    calories_match = re.search(
        r"(?:burn(?:ed)?|ate|consum(?:e|ed)|calories(?:\s*today)?)\D{0,20}(\d+(?:\.\d+)?)",
        text,
    )
    if calories_match:
        calories = float(calories_match.group(1))

    target_match = re.search(
        r"(?:goal|target)\D{0,20}(\d+(?:\.\d+)?)",
        text,
    )
    if target_match:
        calories_target = float(target_match.group(1))

    return {
        "calories": calories,
        "calories_target": calories_target,
    }


def _extract_weight_fallback(message: str) -> float | None:
    text = (message or "").lower()
    match = re.search(r"weight(?:\s*today)?\D{0,20}(\d+(?:\.\d+)?)\s*kg?", text)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def _extract_workout_fallback(message: str) -> int | None:
    text = (message or "").lower()
    match = re.search(r"(\d+)\s*workout", text)
    if not match:
        match = re.search(r"workout\D{0,20}(\d+)", text)
    if not match:
        return None
    try:
        return max(0, int(match.group(1)))
    except ValueError:
        return None


def _extract_profile_fallback(message: str) -> dict:
    text = (message or "").lower()

    age = None
    gender = None
    height_cm = None
    goal = None
    activity_level = None
    allergies = None
    dietary_preference = None

    age_match = re.search(r"(?:\bage\b|\bi am\b|\bi'm\b)\D{0,10}(\d{1,2})\b", text)
    if age_match:
        try:
            parsed = int(age_match.group(1))
            if 10 <= parsed <= 100:
                age = parsed
        except ValueError:
            age = None

    height_match = re.search(r"(?:\bheight\b|\bht\b)\D{0,10}(\d{2,3}(?:\.\d+)?)\s*cm\b", text)
    if height_match:
        try:
            parsed = float(height_match.group(1))
            if 100 <= parsed <= 260:
                height_cm = parsed
        except ValueError:
            height_cm = None

    if re.search(r"\bmale\b|\bman\b", text):
        gender = "male"
    elif re.search(r"\bfemale\b|\bwoman\b", text):
        gender = "female"

    if "fat loss" in text or "weight loss" in text or "lose weight" in text:
        goal = "fat loss"
    elif "muscle gain" in text or "gain muscle" in text or "bulk" in text:
        goal = "muscle gain"
    elif "maintain" in text or "maintenance" in text:
        goal = "maintenance"

    if re.search(r"\bsedentary\b|\blow activity\b|\bdesk job\b", text):
        activity_level = "sedentary"
    elif re.search(r"\blightly active\b|\blight activity\b", text):
        activity_level = "lightly active"
    elif re.search(r"\bmoderate\b|\bmoderately active\b", text):
        activity_level = "moderately active"
    elif re.search(r"\bvery active\b|\bhigh activity\b|\bathlete\b", text):
        activity_level = "very active"

    if re.search(r"\bvegetarian\b|\bveg\b", text):
        dietary_preference = "vegetarian"
    elif re.search(r"\bvegan\b", text):
        dietary_preference = "vegan"
    elif re.search(r"\bnon[-\s]?veg\b|\bomnivore\b", text):
        dietary_preference = "non-vegetarian"
    elif re.search(r"\beggetarian\b", text):
        dietary_preference = "eggetarian"

    allergy_match = re.search(
        r"(?:allerg(?:y|ies)|allergic to)\D{0,15}([a-zA-Z,\s/-]{2,80})",
        text,
    )
    if allergy_match:
        parsed = allergy_match.group(1).strip(" .,:;")
        if parsed:
            allergies = parsed
    elif re.search(r"\bno allerg(?:y|ies)\b|\bnone\b", text):
        allergies = "none"

    return {
        "age": age,
        "gender": gender,
        "height_cm": height_cm,
        "goal": goal,
        "activity_level": activity_level,
        "allergies": allergies,
        "dietary_preference": dietary_preference,
    }


def _apply_profile_fallback(db: Session, user_id: int, payload: dict) -> bool:
    updates = {k: v for k, v in payload.items() if v is not None}
    if not updates:
        return False

    row = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not row:
        row = Profile(user_id=user_id)
        db.add(row)

    for key, value in updates.items():
        setattr(row, key, value)

    return True


def _missing_profile_fields(profile: Profile | None) -> list[str]:
    if not profile:
        return ["gender", "activity_level", "allergies", "dietary_preference"]

    missing = []
    if not profile.gender:
        missing.append("gender")
    if not profile.activity_level:
        missing.append("activity_level")
    if profile.allergies is None or profile.allergies == "":
        missing.append("allergies")
    if not profile.dietary_preference:
        missing.append("dietary_preference")
    return missing


def _build_profile_intake_prompt(missing: list[str], preferred_language: str = "en") -> str | None:
    if not missing:
        return None

    preferred_language = (preferred_language or "en").lower()
    labels_by_lang = {
        "en": {
            "gender": "gender (male/female)",
            "activity_level": "activity level (sedentary/lightly active/moderately active/very active)",
            "allergies": "any food allergies (or say none)",
            "dietary_preference": "dietary preference (vegetarian/vegan/non-vegetarian/eggetarian)",
            "prefix": "Quick profile check: please share your ",
        },
        "hi": {
            "gender": "लिंग (पुरुष/महिला)",
            "activity_level": "गतिविधि स्तर (कम/हल्का सक्रिय/मध्यम सक्रिय/बहुत सक्रिय)",
            "allergies": "कोई खाद्य एलर्जी (न हो तो 'none' लिखें)",
            "dietary_preference": "डायट पसंद (शाकाहारी/वीगन/नॉन-वेज/एगेटेरियन)",
            "prefix": "प्रोफाइल अपडेट: कृपया बताएं ",
        },
        "mr": {
            "gender": "लिंग (पुरुष/स्त्री)",
            "activity_level": "अॅक्टिव्हिटी लेव्हल (कमी/हलके सक्रिय/मध्यम सक्रिय/खूप सक्रिय)",
            "allergies": "अन्नाची ऍलर्जी असल्यास सांगा (नसल्यास 'none')",
            "dietary_preference": "आहार प्रकार (शाकाहारी/व्हेगन/नॉन-व्हेज/एगेटेरियन)",
            "prefix": "प्रोफाइल अपडेट: कृपया सांगा ",
        },
    }
    pack = labels_by_lang.get(preferred_language, labels_by_lang["en"])
    labels = {k: v for k, v in pack.items() if k != "prefix"}
    asked = [labels[m] for m in missing if m in labels]
    if not asked:
        return None
    return pack["prefix"] + ", ".join(asked) + "."


@router.get("/history")
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.asc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "user_message": r.user_message,
            "ai_reply": r.ai_reply,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.post("/chat")
def chat_endpoint(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_row = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    preferred_language = (payload.preferred_language or "").strip().lower()
    if preferred_language not in {"en", "hi", "mr"}:
        preferred_language = (profile_row.preferred_language or "en").lower() if profile_row else "en"
    language_name = {"en": "English", "hi": "Hindi", "mr": "Marathi"}.get(preferred_language, "English")

    # ----- build messages with conversation history -----
    history_rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.asc())
        .limit(10)
        .all()
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI gym trainer and nutrition coach. "
                "Always keep answers concise and practical. "
                "Once the user has clearly stated their fitness goal, height, weight, or age, "
                "remember these values and do NOT ask for them again unless the user says they changed. "
                "Use previous conversation context instead of restarting onboarding. "
                "During onboarding, collect and remember gender (male/female), activity level, allergies, and dietary preference. "
                "If any of these are missing, ask only for the missing fields in one concise question. "
                "When the user provides concrete data (current weight, workouts, calories, macros), "
                "acknowledge it once and then use it in future answers without asking for the same information again. "
                "Calculate BMI and suggest weekly targets when enough data is known. "
                "For diet, give a clear daily plan with calories using mostly Indian meals unless the user asks otherwise. "
                "If they share images of food, estimate calories and macros based on typical Indian recipes. "
                "If they ask about workouts, suggest gym exercises with sets and reps. "
                f"Always reply in {language_name} unless the user explicitly asks for another language. "
                f"Use only {language_name} in the reply body and avoid mixing English sentences. "
                "English words are allowed only for units/symbols like kg, cm, kcal, g and required enum tokens. "
                "Always be encouraging and motivational. "
                "At the END of your reply, add ONE extra line starting with exactly 'LOG_JSON: ' "
                "followed by a single-line JSON object with keys: "
                'log_date (YYYY-MM-DD), weight_kg, calories, calories_target, protein_g, carbs_g, fats_g, workouts_done. '
                "Example: LOG_JSON: "
                '{"log_date": "2026-01-31", "weight_kg": 72.5, "calories": 2100, '
                '"calories_target": 2300, "protein_g": 150, "carbs_g": 220, "fats_g": 60, "workouts_done": 1}. '
                "If you don't know a value, use null. Do not add comments inside the JSON."
            ),
        }
    ]

    for row in history_rows:
        messages.append({"role": "user", "content": row.user_message})
        messages.append({"role": "assistant", "content": row.ai_reply})

    # current user message
    messages.append({"role": "user", "content": payload.message})

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
    )
    ai_text = completion.choices[0].message.content
    clean_reply, log_json = _extract_log_json_and_reply(ai_text)

    fallback = _extract_calorie_fallback(payload.message)
    weight_fallback = _extract_weight_fallback(payload.message)
    workouts_fallback = _extract_workout_fallback(payload.message)
    profile_fallback = _extract_profile_fallback(payload.message)
    if fallback["calories"] is not None or fallback["calories_target"] is not None:
        if not log_json:
            log_json = {}
        log_json["log_date"] = date.today().isoformat()
        # User-provided numbers should override model guesses.
        if fallback["calories"] is not None:
            log_json["calories"] = fallback["calories"]
        if fallback["calories_target"] is not None:
            log_json["calories_target"] = fallback["calories_target"]
    if workouts_fallback is not None:
        if not log_json:
            log_json = {}
        log_json["log_date"] = date.today().isoformat()
        log_json["workouts_done"] = workouts_fallback
    if weight_fallback is not None:
        if not log_json:
            log_json = {}
        log_json["log_date"] = date.today().isoformat()
        log_json["weight_kg"] = weight_fallback

    profile_updated = _apply_profile_fallback(db, current_user.id, profile_fallback)
    profile_row = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    intake_prompt = _build_profile_intake_prompt(_missing_profile_fields(profile_row), preferred_language)
    if intake_prompt and intake_prompt.lower() not in clean_reply.lower():
        clean_reply = f"{clean_reply}\n\n{intake_prompt}" if clean_reply else intake_prompt

    dashboard_updated = _apply_logs_from_json(log_json, db, current_user.id)
    dashboard_updated = dashboard_updated or profile_updated

    # ----- store chat + optionally nutrition entry -----
    chat_row = ChatHistory(
        user_id=current_user.id,
        user_message=payload.message,
        ai_reply=clean_reply,
    )
    db.add(chat_row)

    if "diet" in payload.message.lower() or "meal" in payload.message.lower():
        entry = NutritionEntry(
            user_id=current_user.id,
            prompt=payload.message,
            ai_advice=clean_reply,
        )
        db.add(entry)

    db.commit()

    return {"reply": clean_reply, "dashboard_updated": dashboard_updated}


@router.post("/image-chat")
async def image_chat_endpoint(
    image: UploadFile = File(...),
    prompt: str = Form(""),
    preferred_language: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_row = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    preferred_language = (preferred_language or "").strip().lower()
    if preferred_language not in {"en", "hi", "mr"}:
        preferred_language = (profile_row.preferred_language or "en").lower() if profile_row else "en"
    language_name = {"en": "English", "hi": "Hindi", "mr": "Marathi"}.get(preferred_language, "English")

    image_bytes = await image.read()
    # Groq base64-image requests are limited to ~4MB total payload.
    if len(image_bytes) > 4 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image too large. Please upload an image smaller than 4MB.",
        )

    ext_by_type = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    filename_ext = Path(image.filename or "").suffix.lower()
    chosen_ext = filename_ext if filename_ext in allowed_exts else ext_by_type.get(image.content_type, ".jpg")

    uploads_dir = Path(__file__).resolve().parents[2] / "uploads" / "chat_images"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"user_{current_user.id}_{uuid4().hex}{chosen_ext}"
    stored_file_path = uploads_dir / stored_name
    try:
        stored_file_path.write_bytes(image_bytes)
    except Exception:
        logger.exception("Failed saving uploaded image for user_id=%s", current_user.id)
        raise HTTPException(status_code=500, detail="Failed to save uploaded image.")

    image_path = f"/uploads/chat_images/{stored_name}"
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    prompt_text = (
        prompt.strip()
        or "Identify the food item in this image and say if it is healthy. Estimate calories and macros."
    )

    system_msg = (
        "You are an AI gym trainer and nutrition coach. "
        "Analyze the uploaded food image and provide concise nutrition guidance. "
        f"Always reply in {language_name} unless the user explicitly asks for another language. "
        f"Use only {language_name} in the reply body and avoid mixing English sentences. "
        "English words are allowed only for units/symbols like kg, cm, kcal, g and required enum tokens. "
        "Your reply must follow this format exactly with these headings: "
        "Food item: <most likely dish name>; "
        "Healthy: <Yes/No/Depends>; "
        "Why: <1-2 short reasons>; "
        "Approx macros: <calories kcal, protein g, carbs g, fats g>. "
        "If uncertain, state your confidence briefly and best guess. "
        "At the END of your reply, add ONE extra line starting with exactly 'LOG_JSON: ' "
        "followed by a single-line JSON object with keys: "
        'log_date (YYYY-MM-DD), weight_kg, calories, calories_target, protein_g, carbs_g, fats_g, workouts_done. '
        "If a value is unknown, use null. Do not add comments inside the JSON."
    )

    vision_models = [
        settings.GROQ_VISION_MODEL,
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "meta-llama/llama-4-maverick-17b-128e-instruct",
    ]
    completion = None
    vision_errors: list[str] = []
    seen = set()
    for model_name in vision_models:
        if not model_name or model_name in seen:
            continue
        seen.add(model_name)
        try:
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_msg},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_text},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:{image.content_type};base64,{image_b64}"},
                            },
                        ],
                    },
                ],
            )
            break
        except Exception as exc:
            vision_errors.append(f"{model_name}: {exc}")

    if completion is None:
        logger.error(
            "Image analysis failed for user_id=%s content_type=%s errors=%s",
            current_user.id,
            image.content_type,
            " | ".join(vision_errors),
        )
        raise HTTPException(
            status_code=502,
            detail="Image analysis is unavailable right now. Check GROQ vision model access and server logs.",
        )

    ai_text = completion.choices[0].message.content
    clean_reply, log_json = _extract_log_json_and_reply(ai_text)

    fallback = _extract_calorie_fallback(prompt_text)
    weight_fallback = _extract_weight_fallback(prompt_text)
    workouts_fallback = _extract_workout_fallback(prompt_text)
    profile_fallback = _extract_profile_fallback(prompt_text)
    if fallback["calories"] is not None or fallback["calories_target"] is not None:
        if not log_json:
            log_json = {}
        log_json["log_date"] = date.today().isoformat()
        # User-provided numbers should override model guesses.
        if fallback["calories"] is not None:
            log_json["calories"] = fallback["calories"]
        if fallback["calories_target"] is not None:
            log_json["calories_target"] = fallback["calories_target"]
    if workouts_fallback is not None:
        if not log_json:
            log_json = {}
        log_json["log_date"] = date.today().isoformat()
        log_json["workouts_done"] = workouts_fallback
    if weight_fallback is not None:
        if not log_json:
            log_json = {}
        log_json["log_date"] = date.today().isoformat()
        log_json["weight_kg"] = weight_fallback

    profile_updated = _apply_profile_fallback(db, current_user.id, profile_fallback)
    profile_row = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    intake_prompt = _build_profile_intake_prompt(_missing_profile_fields(profile_row), preferred_language)
    if intake_prompt and intake_prompt.lower() not in clean_reply.lower():
        clean_reply = f"{clean_reply}\n\n{intake_prompt}" if clean_reply else intake_prompt

    dashboard_updated = _apply_logs_from_json(log_json, db, current_user.id)
    dashboard_updated = dashboard_updated or profile_updated

    chat_row = ChatHistory(
        user_id=current_user.id,
        user_message=f"[image] {prompt_text}",
        ai_reply=clean_reply,
    )
    db.add(chat_row)

    entry = NutritionEntry(
        user_id=current_user.id,
        prompt=prompt_text,
        ai_advice=clean_reply,
        image_path=image_path,
    )
    db.add(entry)

    db.commit()
    return {"reply": clean_reply, "dashboard_updated": dashboard_updated}
