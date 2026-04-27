from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.ai_service import stream_generation
from services.prompt_builder import build_test_generation_prompt, FRAMEWORK_NOTES, TEST_TYPE_NOTES, PATTERN_NOTES

router = APIRouter(prefix="/generate", tags=["generate"])

VALID_FRAMEWORKS = set(FRAMEWORK_NOTES.keys())
VALID_TEST_TYPES = set(TEST_TYPE_NOTES.keys())
VALID_PATTERNS = set(PATTERN_NOTES.keys())


class TestGenRequest(BaseModel):
    description: str
    framework: str
    test_type: str
    pattern: str
    additional_context: str = ""


@router.post("/tests")
async def generate_tests(body: TestGenRequest):
    if not body.description.strip():
        raise HTTPException(status_code=422, detail="description is required")
    if body.framework not in VALID_FRAMEWORKS:
        raise HTTPException(status_code=422, detail=f"Invalid framework. Choose from: {sorted(VALID_FRAMEWORKS)}")
    if body.test_type not in VALID_TEST_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid test_type. Choose from: {sorted(VALID_TEST_TYPES)}")
    if body.pattern not in VALID_PATTERNS:
        raise HTTPException(status_code=422, detail=f"Invalid pattern. Choose from: {sorted(VALID_PATTERNS)}")

    prompt = build_test_generation_prompt(
        description=body.description,
        framework_key=body.framework,
        test_type=body.test_type,
        pattern=body.pattern,
        additional_context=body.additional_context,
    )

    async def event_stream():
        async for chunk in stream_generation(prompt):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/options")
def get_options():
    return {
        "frameworks": [
            {"value": "playwright-typescript", "label": "Playwright (TypeScript)", "group": "Playwright"},
            {"value": "playwright-javascript", "label": "Playwright (JavaScript)", "group": "Playwright"},
            {"value": "cypress-typescript", "label": "Cypress (TypeScript)", "group": "Cypress"},
            {"value": "cypress-javascript", "label": "Cypress (JavaScript)", "group": "Cypress"},
            {"value": "selenium-python", "label": "Selenium (Python)", "group": "Selenium"},
            {"value": "selenium-java", "label": "Selenium (Java)", "group": "Selenium"},
            {"value": "selenium-csharp", "label": "Selenium (C#)", "group": "Selenium"},
            {"value": "webdriverio-typescript", "label": "WebdriverIO (TypeScript)", "group": "WebdriverIO"},
            {"value": "pytest-python", "label": "pytest (Python)", "group": "pytest"},
            {"value": "robot-framework", "label": "Robot Framework", "group": "Robot Framework"},
        ],
        "test_types": [
            {"value": "ui-e2e", "label": "UI End-to-End"},
            {"value": "api", "label": "API / Integration"},
            {"value": "unit", "label": "Unit Test"},
            {"value": "mobile", "label": "Mobile (Appium)"},
        ],
        "patterns": [
            {"value": "pom", "label": "Page Object Model"},
            {"value": "simple", "label": "Simple / Flat"},
            {"value": "fixture", "label": "Fixture-based"},
        ],
    }
