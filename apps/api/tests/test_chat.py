"""
Test module for Wind API chat endpoint.

This module contains tests for the chat endpoint of the Wind API.
"""

import pytest
from fastapi.testclient import TestClient

from wind_api.main import app


def test_chat_endpoint_mock_response():
    """
    Test that the chat endpoint returns a mock response when no LLM keys are provided.
    
    Since no LLM provider API keys are configured in the test environment,
    the LLM provider should fall back to its mock implementation and return
    a response containing "[MOCK RESPONSE]".
    """
    # Set up test client
    client = TestClient(app)
    
    # Prepare test data
    test_message = "Hello, Wind!"
    request_data = {
        "messages": [
            {"role": "user", "content": test_message}
        ],
        "streaming": False
    }
    
    # Call the chat endpoint
    response = client.post("/api/agent/chat", json=request_data)
    
    # Verify response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Parse response JSON
    response_data = response.json()
    
    # Verify response structure
    assert "message" in response_data, "Response missing 'message' field"
    assert "content" in response_data["message"], "Response message missing 'content' field"
    
    # Verify mock response content
    assert "[MOCK RESPONSE]" in response_data["message"]["content"], \
        f"Expected '[MOCK RESPONSE]' in content, got: {response_data['message']['content']}"
    
    # Verify steps were recorded
    assert "steps" in response_data, "Response missing 'steps' field"
    assert isinstance(response_data["steps"], list), "Steps should be a list"
    assert len(response_data["steps"]) > 0, "Steps list should not be empty"


def test_chat_endpoint_with_empty_messages():
    """
    Test that the chat endpoint handles empty messages list gracefully.
    """
    # Set up test client
    client = TestClient(app)
    
    # Prepare test data with empty messages
    request_data = {
        "messages": [],
        "streaming": False
    }
    
    # Call the chat endpoint
    response = client.post("/api/agent/chat", json=request_data)
    
    # Verify response - should still return 200 with a response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Parse response JSON
    response_data = response.json()
    
    # Verify response structure
    assert "message" in response_data, "Response missing 'message' field"
