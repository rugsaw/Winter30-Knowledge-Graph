# Data Processing Flow

This document describes the end-to-end data processing pipeline used to transform unstructured text into a structured knowledge graph and enable a truth-grounded query engine powered by an LLM.

## 1. Input Text Ingestion

The pipeline begins with raw unstructured text such as:

- Annual reports
- Financial disclosures
- Research documents
- News articles

This text is treated as the **source of truth candidates**, not as truth itself.

## 2. Ontology-Constrained NER and Relationship Extraction

### Forced Ontology Constraints

Named Entity Recognition (NER) and Relationship Extraction (RE) are performed under strict ontology constraints, which are explicitly provided to the LLM.

These include:

**Allowed Entity Types**
- (e.g., `COMPANY`, `PRODUCT`, `MARKET`, `METRIC`, `TIME_PERIOD`)

**Allowed Predicate Types**
- (e.g., `OWNS`, `REPORTED_REVENUE`, `PART_OF_GROUP`)

**Allowed Measurement Types**
- (e.g., `REVENUE`, `EBITDA`, `GROWTH_RATE`, `VOLUME`)

**Forbidden Rules**

- Disallowed entity–predicate combinations
- Disallowed multiple measurements of the same type for a single entity
- Invalid directionality of relationships

### Why This Matters

This step ensures:

- Schema consistency
- Semantic correctness
- Prevention of hallucinated relationships
- Alignment with downstream graph and query logic

Ontology enforcement effectively turns the LLM into a schema-aware information extractor.

## 3. LLM-Generated Structured JSON Output

An LLM is then used to generate a strictly structured JSON output that represents the extracted knowledge graph.

### JSON Structure Includes

**Entities**

- Unique IDs
- Entity names
- Entity types
- Optional properties

**Relationships**

- Subject entity ID
- Predicate type
- Object entity or measurement ID

**Measurements**

- Metric type
- Value
- Unit
- Time context (if applicable)

This JSON acts as the canonical intermediate representation of the knowledge graph.

## 4. Post-Processing and Graph Pruning

The raw JSON output is further processed to improve graph quality.

### Pruning Isolated Nodes

- Entities with no incoming or outgoing relationships are removed
- Measurements not linked to any entity are discarded

### Benefits

- Reduces graph noise
- Improves visualization clarity
- Prevents meaningless query results
- Ensures every node contributes semantic value

This step enforces that every retained node participates in at least one factual relationship.

## 5. Graph Construction for Visualization

The cleaned JSON is transformed into formats suitable for graph visualization libraries.

### Graph Representations

- NetworkX format (Python)
- vis.js format (Web UI)

### Output Includes

**Node definitions with:**

- Labels
- Types
- Visual styling metadata

**Edge definitions with:**

- Relationship labels
- Directionality

This enables:

- Interactive exploration
- Visual validation of extracted knowledge
- Debugging of extraction quality

## 6. Factual Triplet Generation

From the same cleaned JSON, factual triplets are generated in the form:

```
(SUBJECT, PREDICATE, OBJECT)
```

### Examples

```
(Tata Motors Commercial Vehicles, REPORTED_EBITDA, 6794 crore in FY25)
(Indian Commercial Vehicle Industry, GROWTH_RATE, -1% in FY25)
```

These triplets form the authoritative structured knowledge base used for querying and reasoning.

## 7. Query Engine as a Truth-Grounded RAG Framework

The query engine acts as a Retrieval-Augmented Generation (RAG) layer, where:

- The knowledge graph is the source of truth
- The LLM is used only for reasoning and language generation
- All factual grounding comes from factual triplets

### Query Execution Flow

1. User Query is received

2. Relevant factual triplets are retrieved based on:
   - Entity mentions
   - Predicate types
   - Metric types

3. The query + retrieved triplets are injected into the LLM context

4. The LLM generates a response:
   - Strictly grounded in provided facts
   - No external hallucinated information

### Key Principle

> If a fact is not present in the triplets, it cannot appear in the answer.

## 8. Benefits of This Architecture

- Deterministic and explainable AI behavior
- Strong separation between extraction, storage, and reasoning
- Auditable responses
- Scalable to large document collections
- Domain-agnostic with ontology swapping

## Summary

This data processing flow transforms unstructured text into:

- Ontology-compliant structured knowledge
- Visualizable graphs
- Queryable factual triplets
- A truth-grounded LLM query engine

Together, these components form a robust foundation for enterprise-grade knowledge intelligence systems.
