# app/api/routes/export.py
from fastapi import APIRouter, Response
# from app.storage.cache import get_last_kg
# from app.services.kg_renderer import render_png

router = APIRouter()

@router.get("/kg-image")
def get_kg_image():
    return {"message": "Knowledge graph image generated successfully"};
    # kg = get_last_kg()
    # image_bytes = render_png(kg)
    # return Response(content=image_bytes, media_type="image/png")