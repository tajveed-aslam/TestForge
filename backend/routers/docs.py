from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.ai_service import stream_generation
from services.prompt_builder import build_doc_generation_prompt, DOC_TYPE_PROMPTS

router = APIRouter(prefix="/docs", tags=["docs"])

VALID_DOC_TYPES = set(DOC_TYPE_PROMPTS.keys())


class DocGenRequest(BaseModel):
    description: str
    doc_type: str


@router.post("/generate")
async def generate_doc(body: DocGenRequest):
    if not body.description.strip():
        raise HTTPException(status_code=422, detail="description is required")
    if body.doc_type not in VALID_DOC_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid doc_type. Choose from: {sorted(VALID_DOC_TYPES)}")

    prompt = build_doc_generation_prompt(
        description=body.description,
        doc_type=body.doc_type,
    )

    async def event_stream():
        async for chunk in stream_generation(prompt):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/types")
def get_doc_types():
    return {
        "doc_types": [
            {"value": "test-strategy", "label": "Test Strategy", "group": "QA Planning"},
            {"value": "test-plan", "label": "Test Plan (IEEE 829)", "group": "QA Planning"},
            {"value": "rtm", "label": "Requirements Traceability Matrix", "group": "QA Planning"},
            {"value": "user-stories", "label": "User Stories + Acceptance Criteria", "group": "Agile"},
            {"value": "sprint-planning", "label": "Sprint Planning Document", "group": "Agile"},
            {"value": "bug-report", "label": "Bug Report Template + Samples", "group": "Execution"},
            {"value": "api-docs", "label": "API Documentation", "group": "Development"},
            {"value": "release-notes", "label": "Release Notes", "group": "Delivery"},
        ]
    }
