To run the server use this:

uvicorn app.main:app --host 0.0.0.0 --port 5050

create .env file and paste these contents:
OPENAI_API_KEY=<YOUR_OPEN_AI_API_KEY>
MODEL_NAME=gpt-4o