import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { EnhanceTaskDto } from './dto/enhance-task.dto';
import { ReminderQueryDto } from './dto/reminder-query.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiCookieAuth('session-cookie')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get() @ApiOperation({ summary: 'List the current user’s tasks' })
  list(@CurrentUser() user: AuthUser, @Query() query: TaskQueryDto) { return this.tasks.list(user.id, query); }

  @Get('reminders/upcoming') @ApiOperation({ summary: 'List upcoming reminders for the current user' })
  reminders(@CurrentUser() user: AuthUser, @Query() query: ReminderQueryDto) { return this.tasks.upcomingReminders(user.id, query.hours); }

  @Post() @ApiOperation({ summary: 'Create a task with optional due date and reminder' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskDto) { return this.tasks.create(user.id, dto); }

  @Post('enhance') @ApiOperation({ summary: 'Refine natural-language task input' })
  enhance(@Body() dto: EnhanceTaskDto) { return this.tasks.enhance(dto); }

  @Get(':id') @ApiOperation({ summary: 'Get one owned task and its time logs' })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.tasks.get(user.id, id); }

  @Patch(':id') @ApiOperation({ summary: 'Update an owned task' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) { return this.tasks.update(user.id, id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete an owned task and its logs' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.tasks.remove(user.id, id); }
}
