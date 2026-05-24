import axios from "axios";
import { getBearerAuthHeaders } from "./auth";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

interface ApiUserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  preferences: string[];
  reading_history: number[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  preferences: string[];
  readingHistory: number[];
}

export interface UserProfilePatch {
  name?: string;
  email?: string;
  avatar?: string;
  preferences?: string[];
}

interface ApiUserRating {
  book_id: number;
  stars: number;
  updated_at: string;
}

export interface UserRating {
  bookId: number;
  stars: number;
  updatedAt: string;
}

function mapUserProfile(profile: ApiUserProfile): UserProfile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    role: profile.role,
    preferences: profile.preferences,
    readingHistory: profile.reading_history,
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  return getBearerAuthHeaders();
}

export async function getMyProfile(): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<ApiUserProfile>("/users/me", { headers });
  return mapUserProfile(response.data);
}

export async function patchMyProfile(payload: UserProfilePatch): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const response = await apiClient.patch<ApiUserProfile>("/users/me", payload, { headers });
  return mapUserProfile(response.data);
}

export async function upsertUserRating(bookId: number, stars: number): Promise<UserRating> {
  const headers = await getAuthHeaders();
  const response = await apiClient.put<ApiUserRating>(
    `/users/me/ratings/${bookId}`,
    { stars },
    { headers }
  );

  return {
    bookId: response.data.book_id,
    stars: response.data.stars,
    updatedAt: response.data.updated_at,
  };
}

export async function listMyRatings(): Promise<UserRating[]> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<ApiUserRating[]>("/users/me/ratings", { headers });
  return response.data.map((item) => ({
    bookId: item.book_id,
    stars: item.stars,
    updatedAt: item.updated_at,
  }));
}
