from pydantic import BaseModel

class KGGenerateRequest(BaseModel):
    text: str

class KGQueryRequest(BaseModel):
    query: str