import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'Alex Morgan' }) @IsString() @MinLength(2) @MaxLength(60) name: string;
  @ApiProperty({ example: 'alex@example.com' }) @IsEmail() @MaxLength(160) email: string;
  @ApiProperty({ example: 'Focus123!', minLength: 8 }) @IsString() @MinLength(8) @MaxLength(72) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'password must contain upper and lowercase letters and a number' }) password: string;
}
