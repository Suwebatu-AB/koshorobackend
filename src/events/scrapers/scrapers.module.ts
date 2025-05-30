// Update src/events/scrapers/scrapers.module.ts to include cron service
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from '../events.module';
import { TixScraperService } from './tix-scraper.service';
import { CronService } from './cron.service';
import { ScrapersController } from './scrapers.controller';

@Module({
  imports: [
    EventsModule,
    ScheduleModule.forRoot(), // Add this for cron jobs
  ],
  providers: [TixScraperService, CronService],
  controllers: [ScrapersController],
  exports: [TixScraperService, CronService],
})
export class ScrapersModule {}
