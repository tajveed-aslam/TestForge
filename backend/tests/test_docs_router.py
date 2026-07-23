import services.ai_service as ai_service


def test_get_doc_types_returns_expected_values(client):
    res = client.get("/docs/types")
    assert res.status_code == 200
    values = [t["value"] for t in res.json()["doc_types"]]
    assert "test-strategy" in values
    assert "release-notes" in values


def test_generate_doc_rejects_empty_description(client):
    res = client.post("/docs/generate", json={"description": "  ", "doc_type": "test-strategy"})
    assert res.status_code == 422


def test_generate_doc_rejects_invalid_doc_type(client):
    res = client.post("/docs/generate", json={"description": "a project", "doc_type": "not-real"})
    assert res.status_code == 422


def test_generate_doc_streams_mock_output_in_mock_mode(client, monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", True)
    res = client.post("/docs/generate", json={
        "description": "An e-commerce checkout flow", "doc_type": "test-strategy",
    })
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/event-stream")
    assert "data: [DONE]" in res.text


def test_generate_doc_returns_503_when_not_ready(client, monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    res = client.post("/docs/generate", json={
        "description": "An e-commerce checkout flow", "doc_type": "test-strategy",
    })
    assert res.status_code == 503
