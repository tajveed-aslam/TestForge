import asyncio
import os

from google import genai
from google.genai import types

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

_client: genai.Client | None = None

_DOC_KEYWORDS = (
    "Test Strategy", "Test Plan", "RTM", "User Stor", "Bug Report",
    "Release Notes", "Sprint Planning", "API Documentation",
)


def is_ready() -> tuple[bool, str | None]:
    """Checked by routers before opening an SSE stream, so a missing key
    fails fast with a clean 503 instead of dying mid-stream."""
    if MOCK_MODE:
        return True, None
    if not os.getenv("GEMINI_API_KEY"):
        return False, (
            "GEMINI_API_KEY is not set. Set it in your environment, or set "
            "MOCK_MODE=true to run without a live API key."
        )
    return True, None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


async def _stream_mock(prompt: str):
    from services.mock_responses import MOCK_TEST_CODE, MOCK_DOC
    is_doc = any(kw in prompt for kw in _DOC_KEYWORDS)
    text = MOCK_DOC if is_doc else MOCK_TEST_CODE
    words = text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
        await asyncio.sleep(0.018)


async def stream_generation(prompt: str):
    """Yield text chunks — from Gemini in production, from mock samples in MOCK_MODE."""
    if MOCK_MODE:
        async for chunk in _stream_mock(prompt):
            yield chunk
        return

    client = get_client()
    try:
        stream = await client.aio.models.generate_content_stream(
            model=GEMINI_MODEL,
            contents=prompt,
            # Generated test files and SDLC docs can run long; headroom also
            # covers this model's invisible "thinking" tokens before visible
            # output starts (observed ~500+ on gemini-flash-latest).
            config=types.GenerateContentConfig(max_output_tokens=8192),
        )
        async for chunk in stream:
            if chunk.text:
                yield chunk.text
    except Exception:
        # The SSE response has already started by this point (headers are
        # sent as soon as the first byte streams), so a mid-stream failure
        # — e.g. a rate limit or transient API error — can't become a clean
        # HTTP error status. Yield a readable message instead of silently
        # killing the connection.
        yield (
            "\n\n[TestForge could not reach the AI service right now — this is "
            "often a rate limit on the free API tier. Please try again in a "
            "minute.]"
        )
