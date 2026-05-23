import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

let dsTokenCache: string | null = null;

async function getDataScientistToken(): Promise<string> {
  if (dsTokenCache) {
    return dsTokenCache;
  }
  const response = await apiClient.post<{ access_token: string }>("/auth/login", {
    email: "datasci@example.com",
    password: "password123",
  });
  dsTokenCache = response.data.access_token;
  return dsTokenCache;
}

export interface SVDTrainRequest {
  max_ratings: number;
  test_ratio: number;
  random_seed: number;
  min_user_ratings: number;
  min_book_ratings: number;
  enable_tuning: boolean;
  max_trials: number;
  hyperparameters: {
    factors: number;
    epochs: number;
    learning_rate: number;
    regularization: number;
  };
  tuning_space: {
    factors: number[];
    learning_rates: number[];
    regularizations: number[];
    epochs: number[];
  };
}

export interface SVDTrainResponse {
  job: {
    id: number;
    status: string;
  };
  result: {
    model_type: string;
    train_rmse: number;
    test_rmse: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    training_duration_seconds: number;
    trials_run: number;
  };
}

export interface MLModelOverview {
  model_type: string;
  input_features: string[];
  technique: string;
  description: string;
}

export interface MLExperiment {
  id: number;
  version: string;
  factors: number;
  rmse: number;
  status: string;
  date: string;
}

export interface MLModelMetrics {
  train_rmse: number;
  test_rmse: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  last_trained: string;
  training_duration: string;
}

export interface MLUserActivity {
  month: string;
  users: number;
  active_readers: number;
}

export interface MLPopularBook {
  title: string;
  reads: number;
}

export interface MLProductKpis {
  engagement_rate: number;
  avg_session_minutes: number;
  click_through_rate: number;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getDataScientistToken();
  return { Authorization: `Bearer ${token}` };
}

export async function trainSVD(payload: SVDTrainRequest): Promise<SVDTrainResponse> {
  const headers = await getAuthHeaders();
  const response = await apiClient.post<SVDTrainResponse>("/ml/train", payload, {
    headers,
  });
  return response.data;
}

export async function getModelOverview(): Promise<MLModelOverview> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<MLModelOverview>("/ml/overview", { headers });
  return response.data;
}

export async function getModelExperiments(): Promise<MLExperiment[]> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<MLExperiment[]>("/ml/experiments", { headers });
  return response.data;
}

export async function getModelMetrics(): Promise<MLModelMetrics> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<MLModelMetrics>("/ml/metrics", { headers });
  return response.data;
}

export async function getUserActivity(): Promise<MLUserActivity[]> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<MLUserActivity[]>("/analytics/user-activity", { headers });
  return response.data;
}

export async function getPopularBooks(): Promise<MLPopularBook[]> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<MLPopularBook[]>("/analytics/popular-books", { headers });
  return response.data;
}

export async function getProductKpis(): Promise<MLProductKpis> {
  const headers = await getAuthHeaders();
  const response = await apiClient.get<MLProductKpis>("/analytics/product-kpis", { headers });
  return response.data;
}
