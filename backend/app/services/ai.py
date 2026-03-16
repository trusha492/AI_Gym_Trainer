from app.core.groq_client import client

def generate_coach_reply(system_prompt: str, messages: list[dict]) -> str:
    resp = client.chat.completions.create(
        model="llama3-8b-8192",  # or another Groq-supported model[web:428]
        messages=[{"role": "system", "content": system_prompt}] + messages,
        temperature=0.7,
    )
    return resp.choices[0].message.content
