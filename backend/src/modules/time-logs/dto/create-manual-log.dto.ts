import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateManualLogDto {
  @ApiProperty() @IsString() taskId: string;
  @ApiProperty({ example: '2026-09-11T09:00:00.000Z' }) @Type(() => Date) @IsDate() startedAt: Date;
  @ApiProperty({ example: '2026-09-11T10:00:00.000Z' }) @Type(() => Date) @IsDate() endedAt: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) note?: string;
}
