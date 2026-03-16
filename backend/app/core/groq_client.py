from groq import Groq
from app.core.config import GROQ_API_KEY  # keep key in env/config

client = Groq(api_key=GROQ_API_KEY)
