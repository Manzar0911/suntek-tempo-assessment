import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { AnalyticsService } from './analytics.service';
import { DailySummaryQueryDto } from './dto/daily-summary-query.dto';

@ApiTags('Analytics')
@ApiCookieAuth('session-cookie')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get a timezone-aware daily productivity summary' })
  daily(@CurrentUser() user: AuthUser, @Query() query: DailySummaryQueryDto) { return this.analytics.daily(user.id, query); }

  @Get('weekly-summary')
  @ApiOperation({ summary: 'Get a seven-day productivity trend ending on the selected local date' })
  weekly(@CurrentUser() user: AuthUser, @Query() query: DailySummaryQueryDto) { return this.analytics.weekly(user.id, query); }
}
