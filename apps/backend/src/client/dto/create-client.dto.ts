import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  NAME_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/utils/validators/validation-patterns';

export class CreateClientDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Matches(NAME_PATTERN, { message: VALIDATION_MESSAGES.NAME })
  firstName: string;

  @ApiProperty({ required: false, example: 'Doe' })
  @IsOptional()
  @Matches(NAME_PATTERN, { message: VALIDATION_MESSAGES.NAME })
  lastName?: string;

  @ApiProperty({ required: false, example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: '+34 612 345 678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_user?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_tenant?: string;
}
