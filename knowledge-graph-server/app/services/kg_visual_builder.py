import networkx as nx
import json
from typing import Dict, Any


def build_visual_graph(extracted_kg: Dict[str, Any]) -> str:
    """
    Build a visual representation of the knowledge graph using NetworkX.
    
    Args:
        extracted_kg: Dictionary containing entities, measurements, and facts
        
    Returns:
        JSON string containing node dictionaries with positions and styling for visualization
    """
    # Create NetworkX graph
    G = nx.DiGraph()
    
    # Add all nodes to NetworkX graph
    for eid, e in extracted_kg["entities"].items():
        G.add_node(eid)
    
    for mid, m in extracted_kg["measurements"].items():
        G.add_node(mid)
    
    # Add all edges to NetworkX graph
    for f in extracted_kg["facts"]:
        G.add_edge(f["subject"], f["object"])
    
    # Calculate positions
    pos = nx.spring_layout(G, k=2.0, iterations=100, seed=42)
    
    # Convert to node format similar to HTML output
    networkx_nodes = []
    
    # Add entities
    for eid, e in extracted_kg["entities"].items():
        x, y = pos[eid]
        node = {
            "id": eid,
            "label": e["name"],
            "group": e["type"],
            "node_type": "ENTITY",
            "properties": e.get("properties", {}),
            "shape": "dot",
            "size": 50,
            "x": x * 1000,
            "y": y * 1000,
            "font": {"color": "black", "size": 32}
        }
        networkx_nodes.append(node)
    
    # Add measurements
    for mid, m in extracted_kg["measurements"].items():
        x, y = pos[mid]
        node = {
            "id": mid,
            "label": f'{m["metric"]}: {m["value"]} {m["unit"]}',
            "group": "MEASUREMENT",
            "node_type": "MEASUREMENT",
            "properties": m,
            "shape": "box",
            "size": 50,
            "x": x * 1000,
            "y": y * 1000,
            "font": {"color": "black", "size": 32}
        }
        networkx_nodes.append(node)
    
    networkx_edges = []

    # Add edges
    for f in extracted_kg["facts"]:
        edge = {
            "arrows": "to",
            "from": f["subject"],
            "to": f["object"],
            "label": f["predicate"],
            "font": {"size": 32},
            "smooth": False
        }
        networkx_edges.append(edge)

    return {
        "nodes": networkx_nodes,
        "edges": networkx_edges
    }