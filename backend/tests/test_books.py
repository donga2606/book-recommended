def test_list_books_with_filters(client):
    response = client.get("/api/v1/books", params={"min_rating": 0})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 1
    assert len(payload["items"]) >= 1


def test_get_similar_books(client):
    response = client.get("/api/v1/books/1/similar")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all(item["id"] != 1 for item in items)


def test_get_genres(client):
    response = client.get("/api/v1/genres")
    assert response.status_code == 200
    genres = response.json()
    assert "All" in genres
    assert len(genres) > 1
