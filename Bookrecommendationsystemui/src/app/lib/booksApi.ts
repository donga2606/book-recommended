import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

interface ApiBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  cover_url: string;
  description: string;
  year_published: number;
  page_count: number;
  isbn: string;
}

interface ApiPaginatedBooks {
  items: ApiBook[];
  total: number;
  page: number;
  page_size: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  description: string;
  yearPublished: number;
  pageCount: number;
  isbn: string;
}

export interface PaginatedBooks {
  items: Book[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BooksQueryParams {
  q?: string;
  genre?: string;
  minRating?: number;
  page?: number;
  pageSize?: number;
}

function mapBook(book: ApiBook): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    rating: book.rating,
    coverUrl: book.cover_url,
    description: book.description,
    yearPublished: book.year_published,
    pageCount: book.page_count,
    isbn: book.isbn,
  };
}

export async function listBooks(params: BooksQueryParams = {}): Promise<PaginatedBooks> {
  const response = await apiClient.get<ApiPaginatedBooks>("/books", {
    params: {
      q: params.q || undefined,
      genre: params.genre && params.genre !== "All" ? params.genre : undefined,
      min_rating: params.minRating ?? 0,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
    },
  });

  return {
    items: response.data.items.map(mapBook),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.page_size,
  };
}

export async function listGenres(): Promise<string[]> {
  const response = await apiClient.get<string[]>("/genres");
  return response.data;
}

export async function getBook(bookId: number): Promise<Book> {
  const response = await apiClient.get<ApiBook>(`/books/${bookId}`);
  return mapBook(response.data);
}

export async function getSimilarBooks(bookId: number, limit = 4): Promise<Book[]> {
  const response = await apiClient.get<ApiBook[]>(`/books/${bookId}/similar`, {
    params: { limit },
  });
  return response.data.map(mapBook);
}
