import { Module } from '@nestjs/common';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { ThemeRepository } from './theme.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ThemeController],
  providers: [ThemeService, ThemeRepository],
  exports: [ThemeService, ThemeRepository],
})
export class ThemeModule {}
