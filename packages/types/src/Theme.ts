export class Theme {
  id_theme!: string;
  name!: string;
  backgroundColor!: string;
  brandColor!: string;
  secondaryColor!: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}

export class CreateThemeDto {
  name!: string;
  backgroundColor!: string;
  brandColor!: string;
  secondaryColor!: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}

export class UpdateThemeDto {
  name?: string;
  backgroundColor?: string;
  brandColor?: string;
  secondaryColor?: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}
