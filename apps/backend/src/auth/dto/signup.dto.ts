import { IsOptional, IsString } from 'class-validator';
import { SignInDto } from './signin.dto';

/**
 * Public sign-up DTO. Deliberately does NOT accept `role` or `id_tenant` —
 * public sign-ups are always created as the default role (CLIENT) with no
 * tenant. Admins/employees must be provisioned via the protected
 * `POST /users` endpoint.
 */
export class SignUpDto extends SignInDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
