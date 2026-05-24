import axios from "axios";
import type { Book } from "./booksApi";
import { getBearerAuthHeaders } from "./auth";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1";

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

interface ApiTopRatedBook {
  title: string;
  ratings_count: number;
  avg_rating: number;
}

export interface AdminBookInput {
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

export interface AdminTopRatedBook {
  title: string;
  ratingsCount: number;
  avgRating: number;
}

export interface AdminBooksPage {
  items: Book[];
  total: number;
  page: number;
  pageSize: number;
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

function mapTopRatedBook(row: ApiTopRatedBook): AdminTopRatedBook {
  return {
    title: row.title,
    ratingsCount: row.ratings_count,
    avgRating: row.avg_rating,
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  return getBearerAuthHeaders();
}

export async function listAdminBooks(params: { page?: number; pageSize?: number; q?: string }): Promise<AdminBooksPage> {
  const response = await apiClient.get<{
    items: ApiBook[];
    total: number;
    page: number;
    page_size: number;
  }>("/books", {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 25,
      q: params.q || undefined,
      min_rating: 0,
    },
  });
  return {
    items: response.data.items.map(mapBook),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.page_size,
  };
}

export async function createAdminBook(payload: AdminBookInput): Promise<Book> {
  const headers = await getAuthHeaders();
  const response = await apiClient.post<ApiBook>("/admin/books", payload, { headers });
  return mapBook(response.data);
}

export async function updateAdminBook(bookId: number, payload: AdminBookInput): Promise<Book> {
  const headers = await getAuthHeaders();
  const response = await apiClient.patch<ApiBook>(`/admin/books/${bookId}`, payload, { headers });
  return mapBook(response.data);
}

export async function deleteAdminBook(bookId: number): Promise<void> {
  const headers = await getAuthHeaders();
  await apiClient.delete(`/admin/books/${bookId}`, { headers });
}

export async function listAdminTopRatedBooks(limit = 10): Promise<AdminTopRatedBook[]> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<ApiTopRatedBook[]>("/admin/analytics/top-rated", {
    params: { limit },
    headers,
  });
  return response.data.map(mapTopRatedBook);
}
