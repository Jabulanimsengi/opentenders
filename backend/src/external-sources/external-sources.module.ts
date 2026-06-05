import { Module } from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { ExternalScrapeRunsController } from './external-scrape-runs.controller';
import { ExternalScraperRegistryService } from './external-scraper-registry.service';
import { ExternalSourcesController } from './external-sources.controller';
import { ExternalSourcesService } from './external-sources.service';
import { ExternalTenderImportService } from './external-tender-import.service';
import { AlertsModule } from '../alerts';

@Module({
  imports: [PrismaModule, AlertsModule],
  controllers: [ExternalSourcesController, ExternalScrapeRunsController],
  providers: [
    ExternalSourcesService,
    ExternalScraperRegistryService,
    ExternalTenderImportService,
    AdminGuard,
  ],
  exports: [ExternalSourcesService, ExternalTenderImportService],
})
export class ExternalSourcesModule {}
