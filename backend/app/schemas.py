from pydantic import BaseModel
from typing import List

class Prediction(BaseModel):
    label: str
    confidence: float

class PredictionResponse(BaseModel):
    predictions: List[Prediction]
