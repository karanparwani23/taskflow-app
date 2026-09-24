import { api } from './client';
import { Task, TaskInput, TaskQuery } from '../types';

export async function listTasks(query: TaskQuery = {}): Promise<Task[]> {
  const response = await api.get<Task[]>('/tasks', { params: query });
  return response.data;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const response = await api.post<Task>('/tasks', input);
  return response.data;
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput> & { completed?: boolean },
): Promise<Task> {
  const response = await api.patch<Task>('/tasks/' + id, input);
  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete('/tasks/' + id);
}
