import pytest
from fastapi.testclient import TestClient
from src.app import app

@pytest.fixture
def client():
    return TestClient(app)

# Arrange-Act-Assert pattern

def test_get_activities(client):
    # Arrange: nothing special, client fixture
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_signup_and_duplicate(client):
    # Arrange
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 200
    assert email in response.json()["participants"]

    # Act: try duplicate signup
    response2 = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response2.status_code == 400


def test_delete_participant(client):
    # Arrange
    activity = "Chess Club"
    email = "deleteuser@mergington.edu"
    client.post(f"/activities/{activity}/signup?email={email}")
    # Act
    response = client.delete(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 200
    assert email not in response.json()["participants"]


def test_signup_invalid_activity(client):
    # Arrange
    activity = "Nonexistent"
    email = "nouser@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 404
