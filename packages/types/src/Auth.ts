export class SigninDto {
  email!: string;
  password!: string;
}

export class SignupDto {
  email!: string;
  password!: string;
  firstName?: string;
  lastName?: string;
}

export class AuthTokensDto {
  accessToken!: string;
  refreshToken!: string;
}
