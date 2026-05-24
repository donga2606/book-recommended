import axios from "axios";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1";

export const ACCESS_TOKEN_KEY = "bookrec_access_token";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getBearerAuthHeaders(): Record<string, string> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error("User is not authenticated.");
  }
  return { Authorization: `Bearer ${token}` };
}

export async function loginWithCredentials(email: string, password: string): Promise<string> {
  const response = await authApiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return response.data.access_token;
}

export async function fetchCurrentUser(token?: string): Promise<AuthenticatedUser> {
  const authToken = token ?? getStoredAccessToken();
  if (!authToken) {
    throw new Error("User is not authenticated.");
  }

  const response = await authApiClient.get<AuthenticatedUser>("/users/me", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
}

export async function logoutRequest(): Promise<void> {
  const token = getStoredAccessToken();
  if (!token) {
    return;
  }

  try {
    await authApiClient.post(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch {
    // Backend logout is stateless. Ignore network/backend errors on client cleanup.
  }
}
