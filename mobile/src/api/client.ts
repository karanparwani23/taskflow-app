import axios from 'axios';
import { getAccessToken } from '../storage/sessionStorage';

// USB-connected Android device with `adb reverse tcp:3000 tcp:3000`.
// For the Android emulator, use the host bridge: http://10.0.2.2:3000/api.
export const API_BASE_URL = 'http://127.0.0.1:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join('\n');
    if (typeof message === 'string') return message;
    if (!error.response) {
      return 'Could not reach the TaskFlow API. Check that the backend is running.';
    }
  }
  return 'Something went wrong. Please try again.';
}
