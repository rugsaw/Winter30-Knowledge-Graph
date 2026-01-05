import json
from pathlib import Path
from typing import Optional, Dict, Any, Union, List

# Path to store the last knowledge graph
# Store in the storage directory
_STORAGE_DIR = Path(__file__).parent
_LAST_KG_FILE = _STORAGE_DIR / "last_kg.json"

# In-memory storage for conversation history
_CONVERSATION_HISTORY: List[Dict[str, str]] = []


def save_last_kg(
    kg: Dict[str, Any], 
    visual_graph_nodes: Optional[Union[Dict[str, Any], str]] = None,
    factual_triples: Optional[str] = None
) -> None:
    """
    Save the last generated knowledge graph, visual graph nodes, and factual triples to a JSON file for persistence.
    
    Args:
        kg: The knowledge graph dictionary to save
        visual_graph_nodes: The visual graph nodes (dict or JSON string)
        factual_triples: The factual triples string
    """
    try:
        # Ensure the storage directory exists
        _STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        
        # Prepare data structure with all three components
        data_to_save = {
            "kg": kg,
            "visual_graph_nodes": visual_graph_nodes,
            "factual_triples": factual_triples
        }
        
        # Write the knowledge graph data to JSON file
        with open(_LAST_KG_FILE, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise Exception(f"Failed to save knowledge graph: {str(e)}")


def load_last_kg() -> Optional[Dict[str, Any]]:
    """
    Load the last generated knowledge graph data from the JSON file.
    
    Returns:
        Dictionary containing 'kg', 'visual_graph_nodes', and 'factual_triples' if it exists, None otherwise.
        For backward compatibility, if the file contains only 'kg', returns just the kg dict.
    """
    try:
        if not _LAST_KG_FILE.exists():
            return None
        
        with open(_LAST_KG_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
            
            # New format - return all three components
            return {
                "kg": data.get("kg"),
                "visual_graph_nodes": data.get("visual_graph_nodes"),
                "factual_triples": data.get("factual_triples")
            }
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse knowledge graph JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to load knowledge graph: {str(e)}")


def get_last_kg() -> Optional[Dict[str, Any]]:
    """
    Alias for load_last_kg() for backward compatibility.
    
    Returns:
        Dictionary containing 'kg', 'visual_graph_nodes', and 'factual_triples' if it exists, None otherwise
    """
    return load_last_kg()

def save_conversation_history(conversation_history: List[Dict[str, str]]) -> None:
    """
    Save conversation history to in-memory storage.
    
    Args:
        conversation_history: List of messages in format [{"role": "user/assistant", "content": "..."}]
    """
    global _CONVERSATION_HISTORY
    _CONVERSATION_HISTORY = conversation_history


def get_conversation_history() -> List[Dict[str, str]]:
    """
    Get the current conversation history from in-memory storage.
    
    Returns:
        List of messages in format [{"role": "user/assistant", "content": "..."}]
    """
    return _CONVERSATION_HISTORY.copy()