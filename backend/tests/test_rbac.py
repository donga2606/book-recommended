def test_user_can_read_profile(client, user_token):
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "alex.johnson@example.com"


def test_user_cannot_access_admin(client, user_token):
    response = client.get("/api/v1/admin/books", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403


def test_admin_can_access_admin(client, admin_token):
    response = client.get("/api/v1/admin/books", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_ds_can_access_ml(client, ds_token):
    response = client.get("/api/v1/ml/metrics", headers={"Authorization": f"Bearer {ds_token}"})
    assert response.status_code == 200
    assert "train_rmse" in response.json()


def test_admin_cannot_access_ml(client, admin_token):
    response = client.get("/api/v1/ml/metrics", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 403
