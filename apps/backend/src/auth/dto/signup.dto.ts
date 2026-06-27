import { IsOptional, IsString } from 'class-validator';
import { Transform, type TransformFnParams } from 'class-transformer';
import { SignInDto } from './signin.dto';

// Treat a blank/whitespace-only name as "not provided" so it persists as null
// rather than an empty string — which would also defeat the email-derived name
// fallback when auto-creating the linked Client record.
const blankToUndefined = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() || undefined : value;

/**
 * Public sign-up DTO. Deliberately does NOT accept `role` or `id_tenant` —
 * public sign-ups are always created as the default role (CLIENT) with no
 * tenant. Admins/employees must be provisioned via the protected
 * `POST /users` endpoint.
 */
export class SignUpDto extends SignInDto {
  @IsString()
  @IsOptional()
  @Transform(blankToUndefined)
  firstName?: string;

  @IsString()
  @IsOptional()
  @Transform(blankToUndefined)
  lastName?: string;
}
