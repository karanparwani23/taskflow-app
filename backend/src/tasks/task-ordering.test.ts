import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sortTasks } from './task-ordering';
import { OrderableTask } from './task.types';

interface TestTask extends OrderableTask {
  id: string;
}

describe('sortTasks', () => {
  const now = new Date('2026-01-01T00:00:00.000Z').getTime();
  const tasks: TestTask[] = [
    {
      id: 'low-due-now',
      priority: 'low',
      scheduledAt: new Date(now).toISOString(),
      deadline: new Date(now + 60_000).toISOString(),
      completed: false,
    },
    {
      id: 'high-due-later',
      priority: 'high',
      scheduledAt: new Date(now).toISOString(),
      deadline: new Date(now + 30 * 86_400_000).toISOString(),
      completed: false,
    },
    {
      id: 'overdue',
      priority: 'medium',
      scheduledAt: new Date(now - 86_400_000).toISOString(),
      deadline: new Date(now - 86_400_000).toISOString(),
      completed: false,
    },
    {
      id: 'completed',
      priority: 'high',
      scheduledAt: new Date(now).toISOString(),
      deadline: new Date(now).toISOString(),
      completed: true,
    },
  ];

  it('balances deadline urgency with priority and places completed tasks last', () => {
    assert.deepEqual(
      sortTasks(tasks, 'smart', now).map((task) => task.id),
      ['overdue', 'low-due-now', 'high-due-later', 'completed'],
    );
  });

  it('supports an explicit deadline sort', () => {
    assert.equal(sortTasks(tasks, 'deadline', now)[0].id, 'overdue');
  });
});
