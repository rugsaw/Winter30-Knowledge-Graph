from app.core.llm import get_llm
from app.core.config import settings
from app.storage.cache import load_last_kg, get_conversation_history, save_conversation_history

def query_knowledge_graph(query: str) -> str:
    """
    Answer a natural language question about the knowledge graph using LLM.
    
    Args:
        query: The user's question
        factual_triples: Optional factual triples string for additional context
        
    Returns:
        The answer as a string
    """
    client = get_llm()
    if client is None:
        raise RuntimeError("LLM client not initialized. Call init_llm() first.")
    

    cached_data = load_last_kg()
    factual_triples = cached_data.get("factual_triples")
    # Convert KG to JSON string for context
    # kg_json = json.dumps(kg, indent=2)
    conversation_history = get_conversation_history()
    
    # Build system prompt for query answering
    system_prompt = """
        You are a factual query engine operating ONLY on the provided triples of a finanical document.
        
        These triples are extracted from a finanical document.
        They are in the format (SUBJECT, PREDICATE, OBJECT). There will be a list of these triples in text format.
        
        RULES:
        - You must not use any external knowledge.
        - Do not make up any information.
        - If an answer is not present in the triples, respond with: "Answer cannot be found from the provided data."

        FACTUAL TRIPLES:
        {factual_triples}

        Instructions:
        - Base your answer ONLY on the information present in the knowledge graph or factual triples
        - Reference specific entities, measurements, or facts when relevant
        - Be precise and factual
        - If asked about relationships, explain them clearly
        - If asked about measurements, include values, units, and periods when available
    """
    

    system_prompt = system_prompt.format(factual_triples=factual_triples)

    messages = [
        {"role": "system", "content": system_prompt},
    ]

    if conversation_history:
        messages.extend(conversation_history)

    messages.append({"role": "user", "content": query})

    # Make API call to LLM
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3  # Lower temperature for more consistent answers
    )
    
    # Extract and return the answer
    answer = response.choices[0].message.content

    conversation_history.append({"role": "user", "content": query})
    conversation_history.append({"role": "assistant", "content": answer})
    save_conversation_history(conversation_history)
    print(conversation_history)

    return answer

