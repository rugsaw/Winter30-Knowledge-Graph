# FinScope Knowledge Graph Server

Backend server for the FinScope Knowledge Graph Explorer application.

## Requirements

- **Python**: 3.12.4

## Setup

### 1. Create Virtual Environment

```bash
py -m venv .venv
```

### 2. Activate Virtual Environment

```bash
.venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root with the following:

```env
OPENAI_API_KEY=<YOUR_OPEN_AI_API_KEY>
MODEL_NAME=gpt-4o
```

## Running the Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5050
```

The server will be available at `http://0.0.0.0:5050` or `http://localhost:5050`

