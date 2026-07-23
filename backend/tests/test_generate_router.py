import services.ai_service as ai_service


def test_get_options_returns_frameworks_test_types_and_patterns(client):
    res = client.get("/generate/options")
    assert res.status_code == 200
    body = res.json()
    assert "playwright-typescript" in [f["value"] for f in body["frameworks"]]
    assert "ui-e2e" in [t["value"] for t in body["test_types"]]
    assert "pom" in [p["value"] for p in body["patterns"]]


def test_generate_tests_rejects_empty_description(client):
    res = client.post("/generate/tests", json={
        "description": "   ", "framework": "playwright-typescript",
        "test_type": "ui-e2e", "pattern": "pom",
    })
    assert res.status_code == 422


def test_generate_tests_rejects_invalid_framework(client):
    res = client.post("/generate/tests", json={
        "description": "login flow", "framework": "not-a-real-framework",
        "test_type": "ui-e2e", "pattern": "pom",
    })
    assert res.status_code == 422


def test_generate_tests_rejects_oversized_description(client):
    res = client.post("/generate/tests", json={
        "description": "x" * 4001, "framework": "playwright-typescript",
        "test_type": "ui-e2e", "pattern": "pom",
    })
    assert res.status_code == 422


def test_generate_tests_streams_mock_output_in_mock_mode(client, monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", True)
    res = client.post("/generate/tests", json={
        "description": "User logs in with valid credentials",
        "framework": "playwright-typescript", "test_type": "ui-e2e", "pattern": "pom",
    })
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/event-stream")
    assert "data: [DONE]" in res.text


def test_generate_tests_returns_503_when_not_ready(client, monkeypatch):
    monkeypatch.setattr(ai_service, "MOCK_MODE", False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    res = client.post("/generate/tests", json={
        "description": "User logs in with valid credentials",
        "framework": "playwright-typescript", "test_type": "ui-e2e", "pattern": "pom",
    })
    assert res.status_code == 503
