import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskPriority, TaskSort, TaskStatus } from '../task.types';

export class ListTasksDto {
  @IsOptional()
  @IsIn(['all', 'open', 'completed', 'overdue'])
  status?: TaskStatus;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: TaskPriority;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(32)
  category?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MaxLength(24)
  tag?: string;

  @IsOptional()
  @IsIn(['smart', 'deadline', 'created'])
  sort?: TaskSort;
}
