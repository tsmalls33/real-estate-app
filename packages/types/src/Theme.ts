export class Theme {
  id_theme!: string;
  name!: string;
  primary!: string;
  secondary!: string;
  accent!: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}

export class CreateThemeDto {
  name!: string;
  primary!: string;
  secondary!: string;
  accent!: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}

export class UpdateThemeDto {
  name?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}
