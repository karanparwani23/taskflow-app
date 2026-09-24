import { OrderableTask, TaskSort } from './task.types';

const PRIORITY_WEIGHT = { low: 1, medium: 2, high: 3 } as const;

function timestamp(value: string | Date | undefined): number {
  if (!value) return 0;
  const result = new Date(value).getTime();
  return Number.isFinite(result) ? result : 0;
}

export function smartTaskScore(task: OrderableTask, now = Date.now()): number {
  const dueInDays = (timestamp(task.deadline) - now) / 86_400_000;
  const priorityScore = PRIORITY_WEIGHT[task.priority] * 30;
  const deadlineScore =
    dueInDays < 0
      ? 100 + Math.min(Math.abs(dueInDays), 60)
      : 90 / (1 + dueInDays);
  return priorityScore + deadlineScore;
}

/** Combines urgency and priority, then uses scheduled time to break ties. */
export function sortTasks<T extends OrderableTask>(
  tasks: T[],
  sort: TaskSort = 'smart',
  now = Date.now(),
): T[] {
  return [...tasks].sort((left, right) => {
    if (sort === 'created') {
      return timestamp(right.createdAt) - timestamp(left.createdAt);
    }
    if (sort === 'deadline') {
      return timestamp(left.deadline) - timestamp(right.deadline);
    }

    if (left.completed !== right.completed) return left.completed ? 1 : -1;
    const scoreDifference =
      smartTaskScore(right, now) - smartTaskScore(left, now);
    if (scoreDifference !== 0) return scoreDifference;
    const deadlineDifference =
      timestamp(left.deadline) - timestamp(right.deadline);
    if (deadlineDifference !== 0) return deadlineDifference;
    return timestamp(left.scheduledAt) - timestamp(right.scheduledAt);
  });
}
