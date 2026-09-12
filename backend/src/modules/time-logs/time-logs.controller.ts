import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateManualLogDto } from './dto/create-manual-log.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { TimeLogQueryDto } from './dto/time-log-query.dto';
import { TimeLogsService } from './time-logs.service';

@ApiTags('Time logs') @ApiCookieAuth('session-cookie') @UseGuards(JwtAuthGuard)
@Controller({ path: 'timelogs', version: '1' })
export class TimeLogsController {
  constructor(private readonly logs: TimeLogsService) {}
  @Get() @ApiOperation({ summary: 'List owned time logs' }) list(@CurrentUser() user: AuthUser, @Query() query: TimeLogQueryDto) { return this.logs.list(user.id, query.taskId); }
  @Get('active') @ApiOperation({ summary: 'Get the active timer' }) active(@CurrentUser() user: AuthUser) { return this.logs.active(user.id); }
  @Post('start') @ApiOperation({ summary: 'Start a task timer' }) start(@CurrentUser() user: AuthUser, @Body() dto: StartTimerDto) { return this.logs.start(user.id, dto); }
  @Post('stop') @HttpCode(200) @ApiOperation({ summary: 'Stop timer and atomically create a time log' }) stop(@CurrentUser() user: AuthUser, @Body() dto: StopTimerDto) { return this.logs.stop(user.id, dto); }
  @Post('manual') @ApiOperation({ summary: 'Create a manual time entry' }) manual(@CurrentUser() user: AuthUser, @Body() dto: CreateManualLogDto) { return this.logs.manual(user.id, dto); }
  @Delete(':id') @ApiOperation({ summary: 'Delete an owned time log' }) remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.logs.remove(user.id, id); }
}
