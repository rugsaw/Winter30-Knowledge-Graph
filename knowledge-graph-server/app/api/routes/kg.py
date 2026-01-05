from fastapi import APIRouter, HTTPException
from app.schemas.requests import KGGenerateRequest, KGQueryRequest
from app.services.kg_extractor import extract_knowledge_graph
from app.storage.cache import save_last_kg, save_conversation_history
from app.services.kg_visual_builder import build_visual_graph
from app.services.kg_extractor import extract_factual_triplets
from app.services.kg_query import query_knowledge_graph

router = APIRouter()

@router.post("/generate-knowledge-graph")
def generate_kg(req: KGGenerateRequest):
    extracted_kg = extract_knowledge_graph(req.text)
    visual_graph_nodes = build_visual_graph(extracted_kg)
    factual_triples = extract_factual_triplets(extracted_kg)
    save_last_kg(extracted_kg, visual_graph_nodes, factual_triples)
    save_conversation_history([])
    return {
        "kg": extracted_kg,
        "visual_graph_nodes": visual_graph_nodes,
        "factual_triples": factual_triples
    }

@router.post("/query-knowledge-graph")
def query_kg(req: KGQueryRequest):
    """
    Query the factual triples of the knowledge graph with a natural language question.
    Uses the last generated KG from cache.
    """
    # Query the knowledge graph using LLM (can use factual_triples if available)
    answer = query_knowledge_graph(req.query)
    
    return {
        "answer": answer,
        "query": req.query
    }

@router.post("/clear-conversation")
def clear_conversation():
    """
    Clear the conversation history while keeping the current knowledge graph.
    """
    try:
        save_conversation_history([])
        return {"message": "Conversation history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))