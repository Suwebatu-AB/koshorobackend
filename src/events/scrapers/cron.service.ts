// src/events/scrapers/cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TixScraperService } from './tix-scraper.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly tixScraperService: TixScraperService) {}

  // Run every day at 6 AM
  @Cron('0 6 * * *', {
    timeZone: 'Africa/Lagos',
  })
  async handleDailyScraping() {
    this.logger.log('Starting daily event scraping...');

    try {
      await this.tixScraperService.scrapeEvents();
      this.logger.log('Daily scraping completed successfully');
    } catch (error) {
      this.logger.error('Daily scraping failed:', error.message);
    }
  }

  // Run every 6 hours during December (peak season)
  @Cron('0 */6 * * *', {
    timeZone: 'Africa/Lagos',
  })
  async handleFrequentScrapingInDecember() {
    const currentMonth = new Date().getMonth();

    // Only run in December (month 11)
    if (currentMonth === 11) {
      this.logger.log('Starting frequent December scraping...');

      try {
        await this.tixScraperService.scrapeEvents();
        this.logger.log('December frequent scraping completed');
      } catch (error) {
        this.logger.error('December frequent scraping failed:', error.message);
      }
    }
  }

  // Manual trigger for testing
  async triggerManualScraping() {
    this.logger.log('Manual scraping triggered...');

    try {
      await this.tixScraperService.scrapeEvents();
      this.logger.log('Manual scraping completed');
      return {
        success: true,
        message: 'Manual scraping completed successfully',
      };
    } catch (error) {
      this.logger.error('Manual scraping failed:', error.message);
      return { success: false, message: error.message };
    }
  }
}
