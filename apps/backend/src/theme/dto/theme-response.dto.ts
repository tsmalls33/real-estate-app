import { Theme as SharedTheme } from '@RealEstate/types';

export class ThemeResponseDto implements SharedTheme {
  id_theme: string;
  name: string;
  backgroundColor: string;
  brandColor: string;
  secondaryColor: string;
  logoIcon?: string | null;
  logoBanner?: string | null;
}
