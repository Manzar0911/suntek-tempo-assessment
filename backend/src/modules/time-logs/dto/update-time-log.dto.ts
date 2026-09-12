import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';
export class UpdateTimeLogDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() startedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) note?: string;
}
