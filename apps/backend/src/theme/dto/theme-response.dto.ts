import { Theme as SharedTheme } from '@RealEstate/types';

export class ThemeResponseDto implements SharedTheme {
  id_theme: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}
