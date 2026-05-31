import { UserRoles } from '@RealEstate/types';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  NAME_PATTERN,
  PASSWORD_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/utils/validators/validation-patterns';

export class CreateUserDto {
  @ApiProperty({ required: true, example: 'john@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, example: 'Str0ngP@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, { message: VALIDATION_MESSAGES.PASSWORD })
  password: string;

  @ApiProperty({ required: false, example: 'John' })
  @IsOptional()
  @Matches(NAME_PATTERN, { message: VALIDATION_MESSAGES.NAME })
  firstName?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  @IsOptional()
  @Matches(NAME_PATTERN, { message: VALIDATION_MESSAGES.NAME })
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRoles)
  role?: UserRoles;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_tenant?: string;
}
