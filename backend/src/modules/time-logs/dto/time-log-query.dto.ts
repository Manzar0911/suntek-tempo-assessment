import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class TimeLogQueryDto { @ApiPropertyOptional() @IsOptional() @IsString() taskId?: string; }
