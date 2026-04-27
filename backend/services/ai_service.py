import asyncio
import anthropic
import os

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

_client: anthropic.Anthropic | None = None

_DOC_KEYWORDS = (
    "Test Strategy", "Test Plan", "RTM", "User Stor", "Bug Report",
    "Release Notes", "Sprint Planning", "API Documentation",
)


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
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
    """Yield text chunks — from Claude in production, from mock samples in MOCK_MODE."""
    if MOCK_MODE:
        async for chunk in _stream_mock(prompt):
            yield chunk
        return

    client = get_client()
    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield text


async def generate_text(prompt: str) -> str:
    """Return full generated text in one shot (non-streaming)."""
    if MOCK_MODE:
        from services.mock_responses import MOCK_TEST_CODE, MOCK_DOC
        is_doc = any(kw in prompt for kw in _DOC_KEYWORDS)
        return MOCK_DOC if is_doc else MOCK_TEST_CODE

    client = get_client()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
