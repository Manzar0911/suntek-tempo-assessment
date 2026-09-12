import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ReminderQueryDto {
  @ApiPropertyOptional({ default: 24, minimum: 1, maximum: 168, description: 'Look-ahead window in hours.' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(168)
  hours = 24;
}
