def test_upsert_rating(client, user_token):
    response = client.put(
        "/api/v1/users/me/ratings/2",
        json={"stars": 4},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["book_id"] == 2
    assert payload["stars"] == 4


def test_reading_list_status_update(client, user_token):
    create_response = client.post(
        "/api/v1/users/me/reading-list",
        json={"book_id": 4, "status": "planned"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_response.status_code == 201

    patch_response = client.patch(
        "/api/v1/users/me/reading-list/4",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "completed"
