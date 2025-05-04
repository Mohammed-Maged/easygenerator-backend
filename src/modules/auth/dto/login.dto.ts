import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'mohamed.maged@easygenerator.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'M!croStrongP@ssw0rd2025' })
  @IsString()
  @MinLength(8)
  password: string;
}