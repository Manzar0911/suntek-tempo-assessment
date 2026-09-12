import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
export class EnhanceTaskDto { @ApiProperty({ example: 'follow up with designer' }) @IsString() @MinLength(3) @MaxLength(300) prompt: string; }
