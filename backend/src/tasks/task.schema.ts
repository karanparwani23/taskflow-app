import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TaskPriority } from './task.types';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({ default: '', maxlength: 2000 })
  description!: string;

  @Prop({ required: true, type: Date })
  scheduledAt!: Date;

  @Prop({ required: true, type: Date, index: true })
  deadline!: Date;

  @Prop({ required: true, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority!: TaskPriority;

  @Prop({ default: false, index: true })
  completed!: boolean;

  @Prop({ trim: true, maxlength: 32, index: true })
  category?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ userId: 1, completed: 1, deadline: 1 });
TaskSchema.index({ userId: 1, category: 1 });
