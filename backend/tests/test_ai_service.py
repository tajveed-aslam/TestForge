import asyncio

import services.ai_service as ai_service


def _collect(async_gen):
    async def run():
        return [chunk async for chunk in async_gen]
    return asyncio.run(run())


def test_is_ready_true_when_mock_mode_enabled(monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", True)
    ready, reason = ai_service.is_ready()
    assert ready is True
    assert reason is None


def test_is_ready_false_when_no_key_and_not_mock(monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    ready, reason = ai_service.is_ready()
    assert ready is False
    assert "GEMINI_API_KEY" in reason


def test_is_ready_true_when_key_present_and_not_mock(monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", False)
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key-for-test")
    ready, reason = ai_service.is_ready()
    assert ready is True
    assert reason is None


def test_stream_generation_mock_mode_returns_code_sample(monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", True)
    chunks = _collect(ai_service.stream_generation("Write a login test"))
    text = "".join(chunks)
    assert "PageObject" in text or "test(" in text.lower()


def test_stream_generation_mock_mode_returns_doc_sample_for_doc_keywords(monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", True)
    chunks = _collect(ai_service.stream_generation("Generate a Test Strategy for this project"))
    text = "".join(chunks)
    assert "Test Strategy" in text or "Introduction" in text


def test_stream_generation_yields_readable_message_when_gemini_call_fails(monkeypatch):
    # A live API failure (rate limit, transient error) must not silently
    # kill the SSE connection — the frontend should see a message it can
    # display, not a truncated stream with no explanation.
    monkeypatch.setattr(ai_service, "MOCK_MODE", False)

    class _BoomClient:
        class aio:
            class models:
                @staticmethod
                async def generate_content_stream(**kwargs):
                    raise RuntimeError("429 RESOURCE_EXHAUSTED")

    monkeypatch.setattr(ai_service, "get_client", lambda: _BoomClient())
    chunks = _collect(ai_service.stream_generation("Write a login test"))
    text = "".join(chunks)
    assert "could not reach the AI service" in text
