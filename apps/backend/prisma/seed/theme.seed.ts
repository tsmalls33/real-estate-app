import { PrismaClient } from '@prisma/client';
import { seedUuid } from './_uuid';

const DEFAULT_THEMES = [
  {
    id_theme: 'theme-seed-0001',
    name: 'Default',
    backgroundColor: '#FAFAFA',
    brandColor: '#1976d2',
    secondaryColor: '#ff9800',
  },
  {
    id_theme: 'theme-seed-0002',
    name: 'Dark',
    backgroundColor: '#121212',
    brandColor: '#bb86fc',
    secondaryColor: '#03dac6',
  },
  {
    id_theme: 'theme-seed-0003',
    name: 'Devomart Default',
    backgroundColor: '#F5F5F5',
    brandColor: '#5A303A',
    secondaryColor: '#EB4F1C',
  },
];

export async function seedThemes(prisma: PrismaClient) {
  console.log('Seeding themes...');

  for (const theme of DEFAULT_THEMES) {
    const id_theme = seedUuid(theme.id_theme);
    await prisma.theme.upsert({
      where: { id_theme },
      update: {
        name: theme.name,
        backgroundColor: theme.backgroundColor,
        brandColor: theme.brandColor,
        secondaryColor: theme.secondaryColor,
      },
      create: { ...theme, id_theme },
    });
  }

  console.log('Themes seeded successfully');
}
