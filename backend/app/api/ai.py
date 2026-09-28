from fastapi import APIRouter
from ..schemas import AIMessageAnalysisRequest, AIMessageAnalysisResponse
from ..services.ai_classifier import AIMessageClassifier

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence"])

@router.post("/classify-message", response_model=AIMessageAnalysisResponse)
def test_ai_classification(req: AIMessageAnalysisRequest):
    result = AIMessageClassifier.classify_message(req.message_text, client_name="Rahul Sharma")
    return AIMessageAnalysisResponse(**result)
