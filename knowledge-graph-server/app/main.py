from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.startup import on_startup
from app.api.routes import kg, metadata, export

app = FastAPI(title="Knowledge Graph API")

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.add_event_handler("startup", on_startup)

app.include_router(kg.router, prefix="/api")
app.include_router(metadata.router, prefix="/api")
app.include_router(export.router, prefix="/api")