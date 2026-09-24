import { Task, TaskSort } from '../../types';

const priorityWeight = { low: 1, medium: 2, high: 3 } as const;

export function taskPriorityScore(task: Task, now = Date.now()): number {
  const daysToDeadline =
    (new Date(task.deadline).getTime() - now) / 86_400_000;
  const priority = priorityWeight[task.priority] * 30;
  const urgency =
    daysToDeadline < 0
      ? 100 + Math.min(Math.abs(daysToDeadline), 60)
      : 90 / (1 + daysToDeadline);
  return priority + urgency;
}

export function orderTasks(
  tasks: Task[],
  sort: TaskSort = 'smart',
  now = Date.now(),
): Task[] {
  return [...tasks].sort((left, right) => {
    if (sort === 'created') {
      return (
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime()
      );
    }
    if (sort === 'deadline') {
      return (
        new Date(left.deadline).getTime() -
        new Date(right.deadline).getTime()
      );
    }
    if (left.completed !== right.completed) return left.completed ? 1 : -1;
    const score = taskPriorityScore(right, now) - taskPriorityScore(left, now);
    if (score !== 0) return score;
    const deadline =
      new Date(left.deadline).getTime() - new Date(right.deadline).getTime();
    if (deadline !== 0) return deadline;
    return (
      new Date(left.scheduledAt).getTime() -
      new Date(right.scheduledAt).getTime()
    );
  });
}
