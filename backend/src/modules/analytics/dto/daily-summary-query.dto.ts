import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
export class DailySummaryQueryDto {
  @ApiPropertyOptional({ example: '2026-09-11' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) date?: string;
  @ApiPropertyOptional({ example: -330, description: 'Browser getTimezoneOffset() value in minutes' }) @IsOptional() @Type(() => Number) @IsInt() @Min(-840) @Max(840) timezoneOffset?: number;
}
