# Knowledge Graph Server - Application Documentation

This document provides an overview of the application structure, explaining the purpose of each directory and file within the `app/` folder.

## Directory Structure

```
app/
├── __init__.py              # Python package initialization
├── main.py                  # FastAPI application entry point
├── api/                     # API route handlers
│   └── routes/              # Individual route modules
│       ├── kg.py            # Knowledge graph generation and query endpoints
│       ├── metadata.py      # Metadata and type definitions endpoints
│       └── export.py        # Export functionality endpoints
├── core/                    # Core application configuration and setup
│   ├── config.py            # Application settings and environment variables
│   ├── llm.py               # LLM client initialization and management
│   └── startup.py           # Application startup event handlers
├── domain/                  # Domain-specific type definitions
│   ├── entity_types.py      # Allowed entity type constants
│   ├── metric_types.py      # Allowed metric type constants
│   └── predicate_types.py   # Allowed predicate/relationship type constants
├── schemas/                 # Pydantic request/response models
│   └── requests.py          # API request schema definitions
├── services/                # Business logic and service layer
│   ├── kg_extractor.py      # Knowledge graph extraction from text
│   ├── kg_query.py          # Query answering using knowledge graph
│   └── kg_visual_builder.py # Visual graph representation builder
├── storage/                 # Data persistence and caching
│   ├── cache.py             # Cache management for KG and conversation history
│   └── last_kg.json         # Persisted knowledge graph data (generated)
└── utils/                   # Utility functions (currently empty)
```

## File Descriptions

### Root Level

#### `main.py`
**Purpose**: FastAPI application entry point and configuration.

**Responsibilities**:
- Initializes the FastAPI application instance
- Configures CORS middleware to allow cross-origin requests
- Registers startup event handlers
- Includes API route routers with `/api` prefix

**Key Components**:
- `app`: Main FastAPI application instance
- CORS middleware configuration
- Route registration for `kg`, `metadata`, and `export` routers

---

### API Layer (`api/routes/`)

#### `api/routes/kg.py`
**Purpose**: Knowledge graph generation and query endpoints.

**Endpoints**:
- `POST /api/generate-knowledge-graph`: Extracts knowledge graph from input text, builds visual representation, and saves to cache
- `POST /api/query-knowledge-graph`: Queries the cached knowledge graph with natural language questions
- `POST /api/clear-conversation`: Clears conversation history while preserving the knowledge graph

**Dependencies**:
- `kg_extractor`: Knowledge graph extraction service
- `kg_visual_builder`: Visual graph construction service
- `kg_query`: Query answering service
- `cache`: Storage management

#### `api/routes/metadata.py`
**Purpose**: Provides metadata about allowed types in the knowledge graph schema.

**Endpoints**:
- `GET /api/allowed-types`: Returns all allowed entity, predicate, and metric types
- `GET /api/allowed-entity-types`: Returns allowed entity types
- `GET /api/allowed-predicates`: Returns allowed predicate/relationship types
- `GET /api/allowed-metric-types`: Returns allowed metric types

**Use Case**: Frontend applications can use these endpoints to validate user input or populate dropdown menus.

#### `api/routes/export.py`
**Purpose**: Export functionality for knowledge graphs (currently placeholder).

**Endpoints**:
- `GET /api/kg-image`: Placeholder endpoint for knowledge graph image export (not yet implemented)

---

### Core Layer (`core/`)

#### `core/config.py`
**Purpose**: Application configuration and environment variable management.

**Responsibilities**:
- Loads settings from `.env` file using Pydantic Settings
- Defines configuration schema for:
  - `openai_api_key`: OpenAI API key for LLM access
  - `model_name`: Default model name (defaults to "gpt-4o-mini")

**Usage**: Import `settings` object to access configuration values throughout the application.

#### `core/llm.py`
**Purpose**: LLM client initialization and management.

**Functions**:
- `init_llm()`: Initializes the global OpenAI client with API key from settings
- `get_llm()`: Returns the initialized OpenAI client instance

**Usage**: Called during application startup to initialize the LLM client for use in services.

#### `core/startup.py`
**Purpose**: Application startup event handlers.

**Functions**:
- `on_startup()`: Executes initialization tasks when the FastAPI application starts
  - Currently initializes the LLM client

**Usage**: Registered as an event handler in `main.py` to run setup tasks on server startup.

---

### Domain Layer (`domain/`)

#### `domain/entity_types.py`
**Purpose**: Defines allowed entity types in the knowledge graph schema.

**Content**: List of allowed entity type constants:
- `COMPANY`, `MARKET`, `PRODUCT`, `SEGMENT`, `SUBSIDIARY`, `BRAND`, `REGION`, `COUNTRY`, `DOCUMENT`

**Usage**: Used by `kg_extractor.py` to validate and constrain entity extraction.

#### `domain/predicate_types.py`
**Purpose**: Defines allowed predicate/relationship types between entities.

**Content**: Comprehensive list of relationship types including:
- Ownership relationships: `OWNS`, `OWNED_BY`, `SUBSIDIARY_OF`, `PARENT_OF`
- Financial relationships: `REPORTED_REVENUE`, `RAISED_FUNDS`, `INVESTED_IN`
- Operational relationships: `OFFERS_PRODUCT`, `OPERATES_IN`, `HEADQUARTERED_IN`
- Regulatory relationships: `REGULATED_BY`, `FILED_WITH`, `AUDITED_BY`
- And many more...

**Usage**: Used by `kg_extractor.py` to validate and constrain relationship extraction.

#### `domain/metric_types.py`
**Purpose**: Defines allowed metric types for measurements.

**Content**: List of allowed metric type constants:
- `DEMAND`, `REVENUE`, `PRICE`, `GROWTH_RATE`, `VOLUME`, `CAPACITY`, `SALES`, `PROFIT`, `EBITDA`

**Usage**: Used by `kg_extractor.py` to validate and constrain measurement extraction.

---

### Schemas Layer (`schemas/`)

#### `schemas/requests.py`
**Purpose**: Pydantic models for API request validation.

**Models**:
- `KGGenerateRequest`: Request model for knowledge graph generation
  - `text` (str): Input text to extract knowledge graph from
- `KGQueryRequest`: Request model for knowledge graph queries
  - `query` (str): Natural language question about the knowledge graph

**Usage**: Used by FastAPI route handlers to validate and parse incoming request bodies.

---

### Services Layer (`services/`)

#### `services/kg_extractor.py`
**Purpose**: Core service for extracting knowledge graphs from unstructured text.

**Key Functions**:
- `extract_knowledge_graph(text: str)`: Main extraction function that uses LLM to parse text and generate structured knowledge graph
- `extract_factual_triplets(kg: Dict)`: Converts knowledge graph into factual triple format (subject, predicate, object)

**Responsibilities**:
- Uses OpenAI LLM to extract entities, measurements, and relationships
- Validates extracted data against domain type constraints
- Returns structured JSON knowledge graph with entities, measurements, and facts
- Handles complex financial document parsing with strict schema validation

**Output Format**:
```json
{
  "entities": { "e1": {...}, "e2": {...} },
  "measurements": { "m1": {...}, "m2": {...} },
  "facts": [
    {"subject": "e1", "predicate": "OWNS", "object": "e2"},
    ...
  ]
}
```

#### `services/kg_query.py`
**Purpose**: Service for answering natural language questions about the knowledge graph.

**Key Functions**:
- `query_knowledge_graph(query: str)`: Answers questions using the cached knowledge graph and conversation history

**Responsibilities**:
- Loads the last generated knowledge graph from cache
- Uses factual triples as context for LLM-based query answering
- Maintains conversation history for contextual follow-up questions
- Ensures answers are based only on the provided knowledge graph data

**Features**:
- Conversation history management
- Factual answer generation based on triples
- Error handling for missing data

#### `services/kg_visual_builder.py`
**Purpose**: Builds visual representation of knowledge graphs for frontend visualization.

**Key Functions**:
- `build_visual_graph(extracted_kg: Dict)`: Converts knowledge graph into visual node/edge format

**Responsibilities**:
- Uses NetworkX to create graph structure
- Calculates node positions using spring layout algorithm
- Formats nodes and edges for visualization libraries (e.g., vis.js)
- Distinguishes between entity nodes and measurement nodes with different shapes

**Output Format**:
```json
{
  "nodes": [
    {
      "id": "e1",
      "label": "Company Name",
      "group": "COMPANY",
      "node_type": "ENTITY",
      "x": 100,
      "y": 200,
      ...
    }
  ],
  "edges": [
    {
      "from": "e1",
      "to": "e2",
      "label": "OWNS",
      ...
    }
  ]
}
```

---

### Storage Layer (`storage/`)

#### `storage/cache.py`
**Purpose**: Manages persistence and caching of knowledge graphs and conversation history.

**Key Functions**:
- `save_last_kg(kg, visual_graph_nodes, factual_triples)`: Saves knowledge graph data to JSON file
- `load_last_kg()`: Loads the last saved knowledge graph from JSON file
- `get_last_kg()`: Alias for `load_last_kg()` (backward compatibility)
- `save_conversation_history(history)`: Saves conversation history to in-memory storage
- `get_conversation_history()`: Retrieves conversation history from in-memory storage

**Storage Strategy**:
- Knowledge graph: Persisted to `last_kg.json` file for durability
- Conversation history: Stored in-memory (lost on server restart)

**File Location**: `storage/last_kg.json` (auto-generated)

#### `storage/last_kg.json`
**Purpose**: Persisted storage file for the last generated knowledge graph.

**Content Format**:
```json
{
  "kg": { ... },
  "visual_graph_nodes": { ... },
  "factual_triples": "..."
}
```

**Note**: This file is auto-generated and should not be manually edited.

---

### Utils Layer (`utils/`)

**Purpose**: Utility functions and helpers (currently empty, reserved for future use).

---

## Data Flow

1. **Knowledge Graph Generation**:
   - Client sends text → `api/routes/kg.py` → `services/kg_extractor.py` → LLM → Structured KG
   - KG is processed by `kg_visual_builder.py` for visualization
   - Results saved to cache via `storage/cache.py`

2. **Query Processing**:
   - Client sends query → `api/routes/kg.py` → `services/kg_query.py` → Loads cached KG → LLM → Answer
   - Conversation history maintained for context

3. **Metadata Retrieval**:
   - Client requests types → `api/routes/metadata.py` → Returns domain type constants

---

## Dependencies Between Modules

- **API Routes** → **Services** → **Core** (LLM, Config)
- **Services** → **Domain** (Type validation)
- **Services** → **Storage** (Caching)
- **API Routes** → **Schemas** (Request validation)
- **Core/Startup** → **Core/LLM** (Initialization)

---

## Key Design Patterns

1. **Separation of Concerns**: Clear separation between API, business logic, and data layers
2. **Service Layer**: Business logic isolated in services, reusable across different entry points
3. **Domain-Driven Design**: Type definitions centralized in domain layer
4. **Configuration Management**: Centralized settings via Pydantic Settings
5. **Caching Strategy**: Hybrid approach (file-based for KG, in-memory for conversations)

