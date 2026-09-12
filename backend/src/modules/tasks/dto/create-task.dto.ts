import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Priority, TaskStatus } from '../../../common/enums/task.enums';

export class CreateTaskDto {
  @ApiProperty({ example: 'Follow up with UI designer' })
  @IsString() @MinLength(2) @MaxLength(120)
  title: string;

  @ApiPropertyOptional({ example: 'Confirm the landing page wireframe delivery.' })
  @IsOptional() @IsString() @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'follow up with designer' })
  @IsOptional() @IsString() @MaxLength(300)
  rawInput?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.PENDING })
  @IsOptional() @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional() @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ example: '2026-09-12T17:00:00.000Z', description: 'Optional task deadline in ISO 8601 format.' })
  @IsOptional() @Type(() => Date) @IsDate()
  dueAt?: Date;

  @ApiPropertyOptional({ example: '2026-09-12T16:30:00.000Z', description: 'Optional browser reminder time in ISO 8601 format.' })
  @IsOptional() @Type(() => Date) @IsDate()
  reminderAt?: Date;
}
