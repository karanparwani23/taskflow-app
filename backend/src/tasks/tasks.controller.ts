import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksDto } from './dto/list-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() filters: ListTasksDto) {
    return this.tasksService.listForUser(user.sub, filters);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() input: CreateTaskDto) {
    return this.tasksService.createForUser(user.sub, input);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() input: UpdateTaskDto,
  ) {
    return this.tasksService.updateForUser(user.sub, id, input);
  }

  @Delete(':id')
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.deleteForUser(user.sub, id);
  }
}
