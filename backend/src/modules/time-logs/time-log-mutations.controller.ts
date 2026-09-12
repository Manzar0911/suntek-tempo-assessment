import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { TimeLogMutationsService } from './time-log-mutations.service';
@ApiTags('Time logs') @ApiCookieAuth('session-cookie') @UseGuards(JwtAuthGuard) @Controller({ path: 'timelogs', version: '1' })
export class TimeLogMutationsController {
  constructor(private readonly mutations: TimeLogMutationsService) {}
  @Patch(':id') @ApiOperation({ summary: 'Correct an owned time log and its task aggregate' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTimeLogDto) { return this.mutations.update(user.id, id, dto); }
}
