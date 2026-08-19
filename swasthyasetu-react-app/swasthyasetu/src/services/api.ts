import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'https://swasthyasetu-3cif.onrender.com/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

let tokenCache: string | null = null;

export const setToken = async (token: string | null) => {
  tokenCache = token;
  if (token) {
    await SecureStore.setItemAsync('auth_token', token);
  } else {
    await SecureStore.deleteItemAsync('auth_token');
  }
};

export const getToken = async (): Promise<string | null> => {
  if (tokenCache) return tokenCache;
  const stored = await SecureStore.getItemAsync('auth_token');
  tokenCache = stored;
  return stored;
};

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await setToken(null);
      tokenCache = null;
    }
    return Promise.reject(error);
  }
);

export default api;

export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    if (error.message.includes('timeout')) {
      return 'Request timed out. The server may be waking up, please try again in a few moments.';
    }
    if (error.message.includes('Network Error')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await api.get<ApiResponse<T>>(url, config);
  return response.data;
};

export const apiPost = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return response.data;
};

export const apiPatch = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await api.patch<ApiResponse<T>>(url, data, config);
  return response.data;
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return response.data;
};
