import { PrismaClient } from '@prisma/client';

const DEFAULT_THEMES = [
  {
    id_theme: 'theme-seed-0001',
    name: 'Default',
    primary: '#1976d2',
    secondary: '#9c27b0',
    accent: '#ff9800',
  },
  {
    id_theme: 'theme-seed-0002',
    name: 'Dark',
    primary: '#121212',
    secondary: '#1e1e1e',
    accent: '#bb86fc',
  },
  {
    id_theme: 'theme-seed-0003',
    name: 'Devomart Default',
    primary: '#F5F5F5',
    secondary: '#582E39',
    accent: '#EB4F1C',
  },
];

export async function seedThemes(prisma: PrismaClient) {
  console.log('Seeding themes...');

  for (const theme of DEFAULT_THEMES) {
    await prisma.theme.upsert({
      where: { id_theme: theme.id_theme },
      update: {
        name: theme.name,
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent,
      },
      create: theme,
    });
  }

  console.log('Themes seeded successfully');
}
