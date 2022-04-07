import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  readonly username: string;

  @IsEmail()
  @MinLength(5)
  @MaxLength(255)
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(1024)
  readonly password: string;
}
