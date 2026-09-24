export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'all' | 'open' | 'completed' | 'overdue';
export type TaskSort = 'smart' | 'deadline' | 'created';

export interface User {
  id: string;
  email: string;
}

export interface Session {
  accessToken: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  deadline: string;
  priority: Priority;
  completed: boolean;
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  scheduledAt: string;
  deadline: string;
  priority: Priority;
  category?: string;
  tags: string[];
}

export interface TaskQuery {
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  tag?: string;
  sort?: TaskSort;
}
