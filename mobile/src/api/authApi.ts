import { api } from './client';
import { Session } from '../types';

export interface Credentials {
  email: string;
  password: string;
}

export async function register(credentials: Credentials): Promise<Session> {
  const response = await api.post<Session>('/auth/register', credentials);
  return response.data;
}

export async function login(credentials: Credentials): Promise<Session> {
  const response = await api.post<Session>('/auth/login', credentials);
  return response.data;
}
