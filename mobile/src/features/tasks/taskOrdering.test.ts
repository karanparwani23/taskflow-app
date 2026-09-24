import { orderTasks } from './taskOrdering';
import { Task } from '../../types';

const now = new Date('2026-01-01T00:00:00.000Z').getTime();

function task(
  id: string,
  priority: Task['priority'],
  deadline: number,
  completed = false,
): Task {
  return {
    id,
    title: id,
    description: '',
    scheduledAt: new Date(now).toISOString(),
    deadline: new Date(deadline).toISOString(),
    priority,
    completed,
    tags: [],
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };
}

describe('orderTasks', () => {
  it('balances priority and deadline urgency and puts completed tasks last', () => {
    const tasks = [
      task('low-now', 'low', now + 60_000),
      task('high-later', 'high', now + 30 * 86_400_000),
      task('overdue', 'medium', now - 86_400_000),
      task('done', 'high', now, true),
    ];
    expect(orderTasks(tasks, 'smart', now).map((item) => item.id)).toEqual([
      'overdue',
      'low-now',
      'high-later',
      'done',
    ]);
  });
});
