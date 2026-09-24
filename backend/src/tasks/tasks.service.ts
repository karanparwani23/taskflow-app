import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksDto } from './dto/list-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { sortTasks } from './task-ordering';
import { Task, TaskDocument } from './task.schema';
import { TaskStatus } from './task.types';

interface TaskRecord {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  scheduledAt: Date;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
  ) {}

  async listForUser(
    userId: string,
    filters: ListTasksDto,
  ): Promise<TaskResponse[]> {
    const mongoFilter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    this.applyStatus(mongoFilter, filters.status ?? 'all');
    if (filters.priority) mongoFilter.priority = filters.priority;
    if (filters.category) mongoFilter.category = filters.category;
    if (filters.tag) mongoFilter.tags = filters.tag;

    const records = (await this.tasks
      .find(mongoFilter)
      .lean()
      .exec()) as unknown as TaskRecord[];
    return sortTasks(
      records.map((record) => this.toResponse(record)),
      filters.sort ?? 'smart',
    );
  }

  async createForUser(
    userId: string,
    input: CreateTaskDto,
  ): Promise<TaskResponse> {
    this.assertChronology(input.scheduledAt, input.deadline);
    const created = await this.tasks.create({
      ...input,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      category: input.category?.trim() || undefined,
      tags: this.cleanTags(input.tags),
      userId: new Types.ObjectId(userId),
    });
    return this.toResponse(created.toObject() as unknown as TaskRecord);
  }

  async updateForUser(
    userId: string,
    id: string,
    input: UpdateTaskDto,
  ): Promise<TaskResponse> {
    const objectId = this.asObjectId(id);
    const current = (await this.tasks
      .findOne({ _id: objectId, userId: new Types.ObjectId(userId) })
      .lean()
      .exec()) as TaskRecord | null;
    if (!current) throw new NotFoundException('Task not found.');

    const scheduledAt = input.scheduledAt ?? current.scheduledAt.toISOString();
    const deadline = input.deadline ?? current.deadline.toISOString();
    this.assertChronology(scheduledAt, deadline);

    const update = { ...input };
    if (input.title !== undefined) update.title = input.title.trim();
    if (input.description !== undefined) update.description = input.description.trim();
    if (input.category !== undefined) {
      update.category = input.category.trim() || undefined;
    }
    if (input.tags !== undefined) update.tags = this.cleanTags(input.tags);

    const updated = (await this.tasks
      .findOneAndUpdate(
        { _id: objectId, userId: new Types.ObjectId(userId) },
        { $set: update },
        { new: true, runValidators: true },
      )
      .lean()
      .exec()) as TaskRecord | null;
    if (!updated) throw new NotFoundException('Task not found.');
    return this.toResponse(updated);
  }

  async deleteForUser(userId: string, id: string): Promise<{ deleted: true }> {
    const result = await this.tasks.deleteOne({
      _id: this.asObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) throw new NotFoundException('Task not found.');
    return { deleted: true };
  }

  private applyStatus(
    filter: Record<string, unknown>,
    status: TaskStatus,
  ): void {
    if (status === 'open') filter.completed = false;
    if (status === 'completed') filter.completed = true;
    if (status === 'overdue') {
      filter.completed = false;
      filter.deadline = { $lt: new Date() };
    }
  }

  private assertChronology(scheduledAt: string, deadline: string): void {
    if (new Date(deadline).getTime() < new Date(scheduledAt).getTime()) {
      throw new BadRequestException(
        'The deadline must be after the scheduled date and time.',
      );
    }
  }

  private cleanTags(tags?: string[]): string[] {
    if (!tags) return [];
    return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
  }

  private asObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Task not found.');
    return new Types.ObjectId(id);
  }

  private toResponse(record: TaskRecord): TaskResponse {
    return {
      id: record._id.toString(),
      title: record.title,
      description: record.description ?? '',
      scheduledAt: new Date(record.scheduledAt).toISOString(),
      deadline: new Date(record.deadline).toISOString(),
      priority: record.priority,
      completed: record.completed,
      category: record.category,
      tags: record.tags ?? [],
      createdAt: new Date(record.createdAt).toISOString(),
      updatedAt: new Date(record.updatedAt).toISOString(),
    };
  }
}
