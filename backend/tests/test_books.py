def test_list_books_with_filters(client):
    response = client.get("/api/v1/books", params={"q": "dune", "min_rating": 4})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 1
    assert any(book["title"] == "Dune" for book in payload["items"])


def test_get_similar_books(client):
    response = client.get("/api/v1/books/2/similar")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all(item["id"] != 2 for item in items)


def test_get_genres(client):
    response = client.get("/api/v1/genres")
    assert response.status_code == 200
    genres = response.json()
    assert "All" in genres
    assert "Science Fiction" in genres
