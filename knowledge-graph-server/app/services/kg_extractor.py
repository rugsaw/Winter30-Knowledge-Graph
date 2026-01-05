import json
from typing import Dict, Any
from app.core.llm import get_llm
from app.core.config import settings
from app.domain.entity_types import ALLOWED_ENTITY_TYPES
from app.domain.metric_types import ALLOWED_METRIC_TYPES


def _build_system_prompt(text_context: str) -> str:
    """
    Build the system prompt for knowledge graph extraction.
    """
    allowed_entity_type = "\n".join(ALLOWED_ENTITY_TYPES)
    allowed_metric_type = "\n".join(ALLOWED_METRIC_TYPES)

    allowed_predicates = """
        OWNS, OWNED_BY, SUBSIDIARY_OF, PARENT_OF, AFFILIATE_OF, PART_OF_GROUP,
        JOINT_VENTURE_WITH, MERGED_WITH, ACQUIRED, ACQUIRED_BY, DIVESTED,
        APPOINTED_AS, SERVES_AS, MEMBER_OF_BOARD,
        REPORTED_REVENUE, REPORTED_PROFIT, REPORTED_LOSS, REPORTED_EBITDA,
        ISSUED_SHARES, LISTED_ON, HAS_TICKER,
        RAISED_FUNDS, FUNDED_BY, BORROWED_FROM, ISSUED_DEBT,
        INVESTED_IN, ACQUIRED_STAKE_IN,
        OFFERS_PRODUCT, OFFERS_SERVICE, SUPPLIES, SUPPLIED_BY,
        HEADQUARTERED_IN, REGISTERED_IN, OPERATES_IN,
        REGULATED_BY, FILED_WITH, FINED_BY,
        HAS_RISK_FACTOR, HAS_LITIGATION,
        AUDITED_BY,
        PAID_TAX,
        REPORTED_IN_PERIOD,
        EXTRACTED_FROM_DOCUMENT, EXTRACTED_FROM_PAGE
    """
    
    forbidden_patterns = """
Numeric literals as entities
Free-text objects like "185 MMT in CY24"
Metrics embedded in entity names
Using REPORTED_REVENUE for non-revenue facts
Missing entity or measurement references
Any output that is not valid JSON
"""
    
    system_prompt = """
    You are an information extraction system specialized in financial documents.

    Your task is to:
    - Extract entities, measurements, and relationships
    - Output them as a strict, schema-conformant JSON Knowledge Graph
    - Ensure semantic correctness, no ambiguity, and no free-text leakage

    You must only output valid JSON following the schema defined below.

    OUTPUT FORMAT RULES (MANDATORY):

    1. Output must be valid JSON with three top-level keys:
    - entities
    - measurements
    - facts

    2. Entities:
    - Must represent real-world objects only (Company, Market, Product, Segment).
    - Must NOT include metrics, numbers, time periods, or percentages.
    - Each entity must have: id, name, type, properties.

    3. Measurements:
    - Must be used for all numeric or time-bound information.
    - Must include: metric, value, unit.
    - Period is mandatory if present in text.

    4. Facts:
    - Must be strict triplets: subject, predicate, object.
    - subject and object must reference IDs defined in entities or measurements.
    - Free-text objects are forbidden.

    5. Forbidden:
    - Numeric literals as entities
    - Free-text measurement strings such as "185 MMT in CY24", this should be structured as a measurement with value 185, unit "MMT", and period "CY24"
    - Numeric facts should be structured
    - Overloaded predicates such as REPORTED_REVENUE for non-revenue data

    RULES:
    - Use ONLY the predicates listed in the ALLOWED_PREDICATES enum below.
    - Predicates MUST be in ALL CAPS.
    - DO NOT invent new predicates.
    - DO NOT paraphrase predicates.
    - If a relation cannot be expressed using the allowed predicates, OMIT it.
    - Output only factual statements explicitly present in the text.
    - DO NOT infer, assume, or hallucinate facts.
    - DO NOT explain your reasoning.

    OUTPUT JSON SCHEMA (STRICT):
    Your output must contain exactly these top-level keys:
    {{ 
        "entities": {{}},
        "measurements": {{}},
        "facts": []
    }}
    No additional top-level keys are allowed.

    ENTITIES SCHEMA:
    Purpose: Represents real-world objects only.
    Rules:
    - MUST NOT contain numbers, metrics, percentages, or time periods
    - MUST be reusable across facts
    - MUST be uniquely identifiable
    Structure:
    "entities": {{ 
        "E<ID>": {{
            "name": "string",
            "type": "ENTITY_TYPE",
            "properties": {{}}
        }}
    }}

    ALLOWED_ENTITY_TYPES:
    {allowed_entity_type}
    
    Important Note: If a concept does not fit one of the above entity types, DO NOT create an entity for it.

    MEASUREMENTS SCHEMA:
    Purpose: Represents numeric or time-bound information.
    Rules:
    - MUST include: metric, value, unit
    - Period is mandatory if present in text
    - Free-text measurement strings are forbidden
    - Measurements MUST be used for all numbers
    - Measurements MUST NOT appear as entities
    - Measurements MUST be structured

    Structure:
    "measurements": {{
        "M<ID>": {{
            "metric": "METRIC_TYPE",
            "value": number,
            "unit": "string",
            "period": "string (optional)",
            "source": "string (optional)"
        }}
    }}

    ALLOWED_METRIC_TYPES:
    {allowed_metric_type}

    METRIC ENFORCEMENT RULES (examples):

    Text Pattern	Metric to Use
    "demand was 185 MMT"	DEMAND
    "demand increased by 2.2%"	GROWTH_RATE     // Never use DEMAND for percentage growth
    "price was 21 cpg"	PRICE
    "sales grew by 33.3%"	GROWTH_RATE
    "capacity addition of 4.6 MMT"	CAPACITY
    
    FACTS SCHEMA (TRIPLETS):

    Purpose: Represents relationships between entities and/or measurements.
    Rules:
    - Must be strict triplets: subject, predicate, object
    - subject and object must reference IDs defined in entities or measurements
    - Free-text objects are forbidden
    - If a relationship cannot be expressed using allowed predicates, omit it

    Structure:
    "facts": [
        {{
            "subject": "E<ID>",
            "predicate": "PREDICATE_TYPE",
            "object": "E<ID> | M<ID>"
        }}
    ]

    ALLOWED_PREDICATES:
    {allowed_predicates}

    Predicate Enforcement Rules:
    - HAS_MEASUREMENT MUST be used to link entities to measurements
    - Revenue predicates may ONLY be used with monetary metrics
    - Demand, price, growth, volume MUST NOT use revenue predicates
    - EXTRACTED_FROM_* predicates SHOULD be used for provenance

    FORBIDDEN PATTERNS (HARD FAIL):
    {forbidden_patterns}

    ID ASSIGNMENT RULES (MANDATORY):
    - Entity IDs: E1, E2, E3 … assigned in order of first appearance
    - Measurement IDs: M1, M2, M3 … assigned in order of extraction
    - IDs MUST be deterministic for the same input text

    EXAMPLE OUTPUT:
    Input text (example)
    Global ethylene demand was 185 MMT in CY24. Jio-bp operates 1,916 mobility stations across India.

    Output:
    {{
        "entities": {{
            "E1": {{
                "name": "Global Ethylene Market",
                "type": "MARKET",
                "properties": {{
                    "region": "Global"
                }}
            }},
            "E2": {{
                "name": "Jio-bp",
                "type": "COMPANY",
                "properties": {{
                    "country": "India"
                }}
            }},
            "E3": {{
                "name": "Mobility Station Network",
                "type": "ASSET_NETWORK",
                "properties": {{
                    "operator": "Jio-bp"
                }}
            }}
        }},
        "measurements": {{
            "M1": {{
                "metric": "DEMAND",
                "value": 185,
                "unit": "MMT",
                "period": "CY24"
            }},
            "M2": {{
                "metric": "COUNT",
                "value": 1916,
                "unit": "stations"
            }}
        }},
        "facts": [
            {{
                "subject": "E1",
                "predicate": "HAS_MEASUREMENT",
                "object": "M1"
            }},
            {{
                "subject": "E2",
                "predicate": "OWNS",
                "object": "E3"
            }},
            {{
                "subject": "E3",
                "predicate": "HAS_MEASUREMENT",
                "object": "M2"
            }}
        ]
    }}

    VERY IMPORTANT: Do not add or use tagged string literals in the output such as ```json, ```yaml, or ```sql

    TEXT:
    <<<
    {text_context}
    >>>
    """
    
    return system_prompt.format(
        text_context=text_context,
        forbidden_patterns=forbidden_patterns,
        allowed_predicates=allowed_predicates,
        allowed_metric_type=allowed_metric_type,
        allowed_entity_type=allowed_entity_type
    )


def prune_isolated_nodes(graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove entities and measurements that are not referenced in any facts.
    """
    used_entities = set()
    used_measurements = set()

    for fact in graph["facts"]:
        used_entities.add(fact["subject"])

        if fact["object"].startswith("E"):
            used_entities.add(fact["object"])
        elif fact["object"].startswith("M"):
            used_measurements.add(fact["object"])

    graph["entities"] = {
        eid: e for eid, e in graph["entities"].items()
        if eid in used_entities
    }

    graph["measurements"] = {
        mid: m for mid, m in graph["measurements"].items()
        if mid in used_measurements
    }

    return graph


def extract_knowledge_graph(text: str) -> Dict[str, Any]:
    """
    Extract knowledge graph from text using LLM.
    
    Args:
        text: Input text to extract knowledge graph from
        
    Returns:
        Dictionary containing entities, measurements, and facts
    """
    client = get_llm()
    if client is None:
        raise RuntimeError("LLM client not initialized. Call init_llm() first.")
    
    system_prompt = _build_system_prompt(text)
    
    # Make API call to LLM for knowledge graph extraction
    response = client.chat.completions.create(
        model=settings.model_name,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Please extract the knowledge graph from the provided text context."}
        ],
        temperature=0.3  # Lower temperature for more consistent extraction
    )
    
    # Parse the extracted knowledge graph
    extracted_kg_string = response.choices[0].message.content
    # Parse JSON response
    extracted_kg = json.loads(extracted_kg_string)
    
    # Prune isolated nodes
    extracted_kg = prune_isolated_nodes(extracted_kg)
    
    return extracted_kg


def _build_extract_triplets_system_prompt(extracted_kg_string: str) -> str:
    """
    Build the system prompt for extracting factual triplets from a knowledge graph.
    
    Args:
        extracted_kg_string: JSON string representation of the knowledge graph
        
    Returns:
        Formatted system prompt string
    """
    # Format allowed predicates as comma-separated string matching notebook format
    allowed_predicates = """
OWNS, OWNED_BY, SUBSIDIARY_OF, PARENT_OF, AFFILIATE_OF, PART_OF_GROUP,
JOINT_VENTURE_WITH, MERGED_WITH, ACQUIRED, ACQUIRED_BY, DIVESTED,
APPOINTED_AS, SERVES_AS, MEMBER_OF_BOARD,
REPORTED_REVENUE, REPORTED_PROFIT, REPORTED_LOSS, REPORTED_EBITDA,
ISSUED_SHARES, LISTED_ON, HAS_TICKER,
RAISED_FUNDS, FUNDED_BY, BORROWED_FROM, ISSUED_DEBT,
INVESTED_IN, ACQUIRED_STAKE_IN,
OFFERS_PRODUCT, OFFERS_SERVICE, SUPPLIES, SUPPLIED_BY,
HEADQUARTERED_IN, REGISTERED_IN, OPERATES_IN,
REGULATED_BY, FILED_WITH, FINED_BY,
HAS_RISK_FACTOR, HAS_LITIGATION,
AUDITED_BY,
PAID_TAX,
REPORTED_IN_PERIOD,
EXTRACTED_FROM_DOCUMENT, EXTRACTED_FROM_PAGE
"""
    
    extract_triplets_system_prompt = """
    You are an information extraction system specialized in financial documents.
    From the knowledge graph in JSON format, extract the factual triplets (SUBJECT, PREDICATE, OBJECT).

    Knowledge Graph:
    {extracted_kg}

    Rules:
    - Extract only the triplets that are present in the knowledge graph.
    - Do not invent any new triplets.
    - Do not include any additional information.
    - Only use the predicates, entities and measurements that are present in the knowledge graph.
    - DO NOT infer, assume, or hallucinate facts.
    - DO NOT explain your reasoning.
    
    
    Output Format:
    - Output must be plain text.
    - Line Separated List of Triplets - (SUBJECT, PREDICATE, OBJECT)
    - SUBJECT and OBJECT must always be human-readable names or values, never internal IDs (e.g., E1, M1). 
    - Measurements must be fully resolved:
        - Replace measurement IDs with their actual numeric value, unit, and period (if present).
        - Example:
            DONT: (Company, HAS_MEASUREMENT, M1)
            DO: (Company, HAS_REVENUE, INR 1,146,000,000,000 in FY 2024–25)
    - Resolve HAS_MEASUREMENT into a more specific predicates from {allowed_predicates} based on metric
    - Using HAS_MEASUREMENT and REPORTED_IN_PERIOD is not allowed as a predicate. (Very Important)

    Examples:
    (XYZ Global Holdings Limited, HAS_COUNTRY, India)
    (XYZ Energy & Chemicals Limited, OWNERSHIP_PERCENTAGE, 100%)
    (NovaPolymers BV, HAS_COUNTRY, Netherlands)
    (XYZ Global Holdings Limited, ACQUIRED, XYZ Retail & Consumer Services Limited)
    (XYZ Global Holdings Limited, REPORTED_REVENUE, INR 1,146,000,000,000 in FY 2024–25)
    (Energy, Chemicals & Materials Segment, PROFIT, INR 912,000,000,000 in FY 2024–25)

    Output Constraints:
    - No JSON.
    - No markdown.
    - No explanations.
    - No empty lines.
    - No trailing punctuation.
    - Only valid triplets.

"""
    
    return extract_triplets_system_prompt.format(
        extracted_kg=extracted_kg_string,
        allowed_predicates=allowed_predicates
    )


def extract_factual_triplets(knowledge_graph: Dict[str, Any]) -> str:
    """
    Extract factual triplets from a knowledge graph using LLM.
    
    This function takes a knowledge graph (with entities, measurements, and facts)
    and extracts human-readable triplets in the format (SUBJECT, PREDICATE, OBJECT).
    Measurements are resolved to their actual values, and HAS_MEASUREMENT predicates
    are converted to more specific predicates based on the metric type.
    
    Args:
        knowledge_graph: Dictionary containing entities, measurements, and facts
        
    Returns:
        String containing line-separated triplets in the format (SUBJECT, PREDICATE, OBJECT)
        
    Raises:
        RuntimeError: If LLM client is not initialized
    """
    client = get_llm()
    if client is None:
        raise RuntimeError("LLM client not initialized. Call init_llm() first.")
    
    # Convert knowledge graph to JSON string
    extracted_kg_string = json.dumps(knowledge_graph, indent=2)
    
    # Build system prompt
    system_prompt = _build_extract_triplets_system_prompt(extracted_kg_string)
    
    # Make API call to LLM for triplet extraction
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Please extract the factual triplets from the provided text context."}
        ],
        temperature=0.3  # Lower temperature for more consistent extraction
    )
    
    # Extract and return the triplets
    extracted_factual_triplets_string = response.choices[0].message.content
    return extracted_factual_triplets_string

