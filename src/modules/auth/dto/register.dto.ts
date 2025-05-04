import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NameDto } from './name.dto';
import { IsStrongPassword } from 'src/common/decorators/validation/is-strong-password.validator';

export class RegisterDto extends NameDto {
  @ApiProperty({ example: 'mohamed.maged@easygenerator.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'M!croStrongP@ssw0rd2025' })
  @IsString()
  @MinLength(8, {
    message: 'Password must be at Minimum length of 8 characters',
  })
  @Matches(/[A-Za-z]/, {
    message: 'Password must contain at least one letter',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  })
  @IsStrongPassword({ message: 'Too weak or previously leaked password.' })
  password: string;
}
