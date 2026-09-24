import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { TaskDocument } from './task.schema';
import { TasksService } from './tasks.service';

function record(userId: string) {
  const now = new Date();
  return {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(userId),
    title: 'Prepare proposal',
    description: '',
    scheduledAt: now,
    deadline: new Date(now.getTime() + 3_600_000),
    priority: 'high' as const,
    completed: false,
    category: 'Work',
    tags: ['planning'],
    createdAt: now,
    updatedAt: now,
  };
}

describe('TasksService user scoping', () => {
  const state: {
    listFilter: Record<string, unknown> | null;
    currentFilter: Record<string, unknown> | null;
    updateCall: [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>] | null;
    deleteFilter: Record<string, unknown> | null;
    currentTask: ReturnType<typeof record> | null;
    updatedTask: ReturnType<typeof record> | null;
    deletedCount: number;
  } = {
    listFilter: null,
    currentFilter: null,
    updateCall: null,
    deleteFilter: null,
    currentTask: null,
    updatedTask: null,
    deletedCount: 1,
  };

  const tasks = {
    find: (filter: Record<string, unknown>) => {
      state.listFilter = filter;
      return {
        lean: () => ({
          exec: async () =>
            state.currentTask ? [state.currentTask] : [],
        }),
      };
    },
    findOne: (filter: Record<string, unknown>) => {
      state.currentFilter = filter;
      return {
        lean: () => ({ exec: async () => state.currentTask }),
      };
    },
    findOneAndUpdate: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options: Record<string, unknown>,
    ) => {
      state.updateCall = [filter, update, options];
      return {
        lean: () => ({ exec: async () => state.updatedTask }),
      };
    },
    deleteOne: async (filter: Record<string, unknown>) => {
      state.deleteFilter = filter;
      return { deletedCount: state.deletedCount };
    },
  };
  let service: TasksService;

  beforeEach(() => {
    state.listFilter = null;
    state.currentFilter = null;
    state.updateCall = null;
    state.deleteFilter = null;
    state.currentTask = null;
    state.updatedTask = null;
    state.deletedCount = 1;
    service = new TasksService(tasks as unknown as Model<TaskDocument>);
  });

  it('adds the authenticated owner to task list filters', async () => {
    const userId = new Types.ObjectId().toString();
    state.currentTask = record(userId);

    const result = await service.listForUser(userId, {
      status: 'open',
      priority: 'high',
      category: 'Work',
      tag: 'planning',
      sort: 'smart',
    });

    assert.ok(state.listFilter);
    assert.equal(
      (state.listFilter.userId as Types.ObjectId).toString(),
      userId,
    );
    assert.deepEqual(
      {
        completed: state.listFilter.completed,
        priority: state.listFilter.priority,
        category: state.listFilter.category,
        tags: state.listFilter.tags,
      },
      {
        completed: false,
        priority: 'high',
        category: 'Work',
        tags: 'planning',
      },
    );
    assert.equal(result[0].title, 'Prepare proposal');
    assert.equal('userId' in result[0], false);
  });

  it('only updates a task when both its id and owner match', async () => {
    const userId = new Types.ObjectId().toString();
    const ownedTask = record(userId);
    state.currentTask = ownedTask;
    state.updatedTask = { ...ownedTask, completed: true };

    await service.updateForUser(userId, ownedTask._id.toString(), {
      completed: true,
    });

    assert.ok(state.currentFilter);
    assert.equal(
      (state.currentFilter.userId as Types.ObjectId).toString(),
      userId,
    );
    assert.ok(state.updateCall);
    assert.equal(
      (state.updateCall[0].userId as Types.ObjectId).toString(),
      userId,
    );
    assert.deepEqual(state.updateCall[1], { $set: { completed: true } });
    assert.deepEqual(state.updateCall[2], { new: true, runValidators: true });
  });

  it('returns not found when the task does not belong to the signed-in user', async () => {
    const userId = new Types.ObjectId().toString();
    const anotherUsersTaskId = new Types.ObjectId().toString();

    await assert.rejects(
      () =>
        service.updateForUser(userId, anotherUsersTaskId, {
          completed: true,
        }),
      NotFoundException,
    );
    assert.equal(state.updateCall, null);
  });

  it('only deletes a task under the authenticated owner id', async () => {
    const userId = new Types.ObjectId().toString();
    const taskId = new Types.ObjectId().toString();

    assert.deepEqual(await service.deleteForUser(userId, taskId), {
      deleted: true,
    });
    assert.ok(state.deleteFilter);
    assert.equal(
      (state.deleteFilter.userId as Types.ObjectId).toString(),
      userId,
    );
    assert.equal(
      (state.deleteFilter._id as Types.ObjectId).toString(),
      taskId,
    );
  });
});
