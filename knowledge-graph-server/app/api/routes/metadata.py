# app/api/routes/metadata.py
from fastapi import APIRouter
from app.domain.entity_types import ALLOWED_ENTITY_TYPES
from app.domain.predicate_types import ALLOWED_PREDICATE_TYPES
from app.domain.metric_types import ALLOWED_METRIC_TYPES

router = APIRouter()

@router.get("/allowed-types")
def allowed_types():
    return {
        "entity_types": ALLOWED_ENTITY_TYPES,
        "predicate_types": ALLOWED_PREDICATE_TYPES,
        "metric_types": ALLOWED_METRIC_TYPES
    }

@router.get("/allowed-entity-types")
def entity_types():
    return ALLOWED_ENTITY_TYPES

@router.get("/allowed-predicates")
def predicates():
    return ALLOWED_PREDICATE_TYPES

@router.get("/allowed-metric-types")
def metrics():
    return ALLOWED_METRIC_TYPES