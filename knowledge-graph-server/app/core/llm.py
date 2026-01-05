from openai import OpenAI
from app.core.config import settings

client = None

def init_llm():
    global client
    client = OpenAI(api_key=settings.openai_api_key)

def get_llm():
    return client