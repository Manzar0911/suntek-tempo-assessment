import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
export class StopTimerDto { @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) note?: string; }
