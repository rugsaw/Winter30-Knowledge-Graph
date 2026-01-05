<div align="center">
  <img src="docs/images/finscope.svg" alt="FinScope Knowledge Graph Explorer" width="500"/>
</div>

# FinScope Knowledge Graph Explorer for Finance Documents

## Winter30 AI Challenge

The track chosen was:

**Task Name: "The Financial Detective"**
 
The Task: Take the provided raw text file (a messy 5-page excerpt from a Reliance Annual Report). Write a script that extracts specific Entities (Company Names, Risk Factors, Dollar Amounts) and Relationships (e.g., Reliance Retail -> OWNS -> Hamleys) and outputs them into a strict JSON Knowledge Graph format.

- **The Constraint**: You cannot use regex. You must use an LLM (local Llama or GPT-4o) to do the extraction. The JSON schema must be valid.
- **The Deliverable**:
  1. The Python script.
  2. The graph_output.json file.
  3. A visual representation (screenshot) of the graph (using a library like NetworkX or just a Mermaid chart).

## Documentation

For a comprehensive understanding of knowledge graphs, their concepts, and related technologies, see the [Concepts Documentation](docs/CONCEPTS.md).

To check out the main data processing logic flow for knowledge graph creation, see the [Data Processing Documentation](docs/DATA-PROCESSING.md)

This project consists of two parts the User Interface where the user will be interacting
with knowledge graphs and the backend API server which is responsible for providing and processing data, data extraction (Named Entity Retrieval and Relationship Extraction) and knowledge graph building. See the [Knowlege Graph Explorer](knowledge-graph-explorer/README.md) and the [Knowledge Graph Server](knowledge-graph-server/README.md)