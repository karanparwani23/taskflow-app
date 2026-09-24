export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'all' | 'open' | 'completed' | 'overdue';
export type TaskSort = 'smart' | 'deadline' | 'created';

export interface OrderableTask {
  priority: TaskPriority;
  scheduledAt: string | Date;
  deadline: string | Date;
  completed: boolean;
  createdAt?: string | Date;
}
