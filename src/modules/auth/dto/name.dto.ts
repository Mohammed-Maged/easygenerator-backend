import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class NameDto {
  @ApiProperty({ example: 'Mohamed' })
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1))
  firstName: string;

  @ApiProperty({ example: 'Maged' })
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1))
  lastName: string;
}
