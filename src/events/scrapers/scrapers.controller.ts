// src/events/scrapers/scrapers.controller.ts
import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TixScraperService } from './tix-scraper.service';

@ApiTags('scrapers')
@Controller('scrapers')
export class ScrapersController {
  constructor(private readonly tixScraperService: TixScraperService) {}

  @Post('tix-africa')
  @ApiOperation({ summary: 'Scrape events from Tix.africa' })
  @ApiResponse({ status: 200, description: 'Events scraped successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async scrapeTixAfrica() {
    try {
      await this.tixScraperService.scrapeEvents();
      return {
        success: true,
        message: 'Tix.africa events scraped successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to scrape Tix.africa events',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('scrape-all')
  @ApiOperation({ summary: 'Scrape events from all sources' })
  @ApiResponse({ status: 200, description: 'All events scraped successfully' })
  async scrapeAllSources() {
    const results = {
      tixAfrica: { success: false, message: '', error: null },
    };

    // Scrape Tix.africa
    try {
      await this.tixScraperService.scrapeEvents();
      results.tixAfrica = {
        success: true,
        message: 'Tix.africa scraped successfully',
        error: null,
      };
    } catch (error) {
      results.tixAfrica = {
        success: false,
        message: 'Failed to scrape Tix.africa',
        error: error.message,
      };
    }

    return {
      success: Object.values(results).some((r) => r.success),
      results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get scraper status' })
  @ApiResponse({ status: 200, description: 'Scraper status retrieved' })
  getScraperStatus() {
    return {
      availableScrapers: ['tix-africa'],
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
