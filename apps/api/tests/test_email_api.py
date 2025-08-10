"""
Test module for Wind API email endpoints.

This module contains tests for the email-related endpoints of the Wind API.
"""

import pytest
from fastapi.testclient import TestClient

from wind_api.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


def test_get_email_folders(client):
    """
    Test that the email folders endpoint returns a valid response.
    
    This test checks that:
    1. The endpoint returns a 200 status code
    2. The response contains a 'folders' key with a list value
    3. Each folder has the expected structure
    """
    # Call the folders endpoint
    response = client.get("/api/email/folders")
    
    # Verify response status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Parse response JSON
    data = response.json()
    
    # Verify response structure
    assert "folders" in data, "Response missing 'folders' key"
    assert isinstance(data["folders"], list), "'folders' should be a list"
    
    # If folders exist, check the structure of the first folder
    if data["folders"]:
        folder = data["folders"][0]
        assert "id" in folder, "Folder missing 'id' field"
        assert "name" in folder, "Folder missing 'name' field"
        assert "system" in folder, "Folder missing 'system' field"
        assert "unread_count" in folder, "Folder missing 'unread_count' field"


def test_get_email_messages(client):
    """
    Test that the email messages endpoint returns a valid response.
    
    This test checks that:
    1. The endpoint returns a 200 status code
    2. The response contains the expected pagination structure
    3. The response contains an 'emails' key with a list value
    """
    # Call the messages endpoint (default: Inbox folder)
    response = client.get("/api/email/messages")
    
    # Verify response status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Parse response JSON
    data = response.json()
    
    # Verify response structure
    assert "emails" in data, "Response missing 'emails' key"
    assert isinstance(data["emails"], list), "'emails' should be a list"
    
    # Verify pagination fields
    assert "total" in data, "Response missing 'total' field"
    assert "page" in data, "Response missing 'page' field"
    assert "page_size" in data, "Response missing 'page_size' field"
    assert "total_pages" in data, "Response missing 'total_pages' field"
    
    # If emails exist, check the structure of the first email
    if data["emails"]:
        email = data["emails"][0]
        assert "id" in email, "Email missing 'id' field"
        assert "subject" in email, "Email missing 'subject' field"
        assert "from" in email, "Email missing 'from' field"
        assert "to" in email, "Email missing 'to' field"
        assert "body_text" in email, "Email missing 'body_text' field"


def test_get_email_messages_with_params(client):
    """
    Test that the email messages endpoint handles query parameters correctly.
    
    This test checks that:
    1. The endpoint returns a 200 status code with query parameters
    2. The 'page' parameter is correctly reflected in the response
    """
    # Call the messages endpoint with query parameters
    response = client.get("/api/email/messages?folder=Sent&page=1&page_size=10&unread_only=true")
    
    # Verify response status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Parse response JSON
    data = response.json()
    
    # Verify that the page parameter is reflected in the response
    assert data["page"] == 1, f"Expected page 1, got {data['page']}"
    assert data["page_size"] == 10, f"Expected page_size 10, got {data['page_size']}"
