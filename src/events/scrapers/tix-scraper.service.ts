// src/events/scrapers/tix-scraper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { EventsService } from '../events.service';
import { CreateEventDto } from 'src/dto/event.dto';

interface ScrapedEventBasic {
  eventName: string;
  eventSlug: string;
  originalUrl: string;
  imageUrl?: string;
  description?: string;
}

interface ScrapedEventDetailed extends ScrapedEventBasic {
  date: string;
  time?: string;
  duration?: string;
  location: string;
  venue?: string;
  price: string;
  ticketLink: string;
  category: string;
  aboutEvent?: string;
  bannerUrl?: string;
  organizer?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  directionsUrl?: string;
  ticketTypes?: Array<{
    name: string;
    price: string;
    description?: string;
  }>;
  tags?: string[];
}

@Injectable()
export class TixScraperService {
  private readonly logger = new Logger(TixScraperService.name);

  constructor(private readonly eventsService: EventsService) {}

  // Helper function to delay execution
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async scrapeEvents(): Promise<void> {
    const browser = await puppeteer.launch({
      headless: false, // Keep false for debugging
      executablePath:
        'C:\\Users\\olade\\.cache\\puppeteer\\chrome\\win64-121.0.6167.85\\chrome-win64\\chrome.exe',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    });

    try {
      const page = await browser.newPage();

      // Set a more recent user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      );
      await page.setViewport({ width: 1920, height: 1080 });

      // Enable request interception to monitor API calls
      await page.setRequestInterception(true);
      const apiResponses: any[] = [];

      page.on('request', (req) => {
        // Log API requests to understand the data flow
        if (req.url().includes('api') || req.url().includes('events')) {
          this.logger.debug(`API Request: ${req.url()}`);
        }
        req.continue();
      });

      page.on('response', async (res) => {
        // Capture API responses that might contain event data
        if (res.url().includes('api') && res.url().includes('event')) {
          try {
            const data = await res.json();
            apiResponses.push(data);
            this.logger.debug(
              `API Response from ${res.url()}: ${JSON.stringify(data).substring(0, 200)}...`,
            );
          } catch (e) {
            // Response might not be JSON
          }
        }
      });

      this.logger.log('Navigating to Tix.africa events page...');

      // Navigate to the all events page which shows more events
      await page.goto('https://tix.africa/discover/all?country=nigeria', {
        waitUntil: 'networkidle0', // Wait for network to be idle
        timeout: 60000,
      });

      // Wait for key elements that indicate content has loaded
      try {
        await Promise.race([
          page.waitForSelector('div[class*="Event"]'),
          page.waitForSelector('div[class*="Card"]'),
          page.waitForSelector('[data-testid*="event"]'),
          this.delay(15000), // Fallback timeout
        ]);
      } catch (error) {
        this.logger.warn('Timeout while waiting for event elements to load');
      }

      // Scroll down to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 500;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve(null);
            }
          }, 100);
        });
      });

      // Wait a bit more after scrolling
      await this.delay(5000); // Replace waitForTimeout

      // Take screenshot for debugging
      await page.screenshot({
        path: 'debug-tix-after-scroll.png',
        fullPage: true,
      });

      // Get page content for debugging
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body.innerText.substring(0, 1000),
          eventElements: document.querySelectorAll('*').length,
        };
      });

      this.logger.log(`Page info: ${JSON.stringify(pageContent)}`);

      // Look for events with more specific selectors based on modern React patterns
      const events: ScrapedEventBasic[] = await page.evaluate(() => {
        const scrapedEvents: any[] = [];

        // Try multiple selector strategies
        const selectorStrategies = [
          // Common React component patterns
          'div[class*="Event"], div[class*="event"]',
          'div[class*="Card"], div[class*="card"]',
          'article, section',
          'div[data-testid*="event"], div[data-cy*="event"]',
          // Look for divs that contain common event information
          'div:has(img):has(a)',
          // Fallback: any div with substantial content
          'div',
        ];

        let eventElements: Element[] = [];

        for (const strategy of selectorStrategies) {
          try {
            const elements = document.querySelectorAll(strategy);
            const filteredElements = Array.from(elements).filter((el) => {
              const text = el.textContent || '';
              const hasLink = el.querySelector('a') !== null;
              const hasImage = el.querySelector('img') !== null;
              const hasReasonableLength =
                text.length > 50 && text.length < 2000;
              const hasEventKeywords =
                /event|concert|show|party|festival|conference/i.test(text);
              const hasLocation = /lagos|abuja|nigeria|venue/i.test(text);
              const hasDate =
                /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(
                  text,
                );
              const hasPrice = /₦|NGN|free|price/i.test(text);

              // Score the element
              let score = 0;
              if (hasLink) score += 2;
              if (hasImage) score += 2;
              if (hasEventKeywords) score += 3;
              if (hasLocation) score += 2;
              if (hasDate) score += 2;
              if (hasPrice) score += 1;
              if (hasReasonableLength) score += 1;

              return score >= 4; // Minimum score threshold
            });

            if (filteredElements.length > 0) {
              eventElements = filteredElements;
              console.log(
                `Found ${eventElements.length} potential events using strategy: ${strategy}`,
              );
              break;
            }
          } catch (e) {
            console.warn(`Strategy failed: ${strategy}`, e);
          }
        }

        // If still no events found, try to find any content that looks like events
        if (eventElements.length === 0) {
          const allDivs = document.querySelectorAll('div');
          eventElements = Array.from(allDivs)
            .filter((div) => {
              const text = div.textContent || '';
              const children = div.children.length;
              return (
                children > 2 &&
                children < 20 &&
                text.length > 100 &&
                text.length < 1000 &&
                (text.includes('₦') ||
                  text.includes('Lagos') ||
                  text.includes('Abuja')) &&
                div.querySelector('img') &&
                div.querySelector('a')
              );
            })
            .slice(0, 20); // Limit to prevent too many false positives
        }

        console.log(
          `Processing ${eventElements.length} potential event elements`,
        );

        eventElements.forEach((element, index) => {
          try {
            const allText = element.textContent?.trim() || '';

            // Extract event name (try multiple methods)
            let eventName = '';

            // Method 1: Look for headings
            const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headings.length > 0) {
              eventName = headings[0].textContent?.trim() || '';
            }

            // Method 2: Look for strong/bold text
            if (!eventName) {
              const boldElements = element.querySelectorAll(
                'strong, b, [class*="title"], [class*="name"]',
              );
              if (boldElements.length > 0) {
                eventName = boldElements[0].textContent?.trim() || '';
              }
            }

            // Method 3: Use first meaningful line
            if (!eventName) {
              const lines = allText
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 10);
              if (lines.length > 0) {
                eventName = lines[0].substring(0, 100);
              }
            }

            // Skip if we can't find a reasonable event name
            if (!eventName || eventName.length < 5) {
              return;
            }

            // Extract date
            let dateText = '';
            const datePatterns = [
              /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/,
              /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/i,
              /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b/i,
              /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^,]*\d{1,2}[^,]*\d{4}/i,
            ];

            for (const pattern of datePatterns) {
              const match = allText.match(pattern);
              if (match) {
                dateText = match[0];
                break;
              }
            }

            // Extract location
            const locationPatterns = [
              /\b(Lagos|Abuja|Port Harcourt|Kano|Ibadan|Benin|Jos|Kaduna|Enugu|Calabar)[^,\n]*/i,
              /venue[:\s]+([^,\n]+)/i,
              /location[:\s]+([^,\n]+)/i,
              /at\s+([^,\n]+)/i,
            ];

            let location = '';
            for (const pattern of locationPatterns) {
              const match = allText.match(pattern);
              if (match) {
                location = match[0].trim();
                break;
              }
            }

            // Extract price
            const pricePatterns = [
              /₦[\d,]+/,
              /NGN\s*[\d,]+/,
              /\b\d{1,3}(,\d{3})*\s*(naira|₦|NGN)/i,
              /\b(free|₦0|NGN\s*0)\b/i,
            ];

            let price = 'Free';
            for (const pattern of pricePatterns) {
              const match = allText.match(pattern);
              if (match) {
                price = match[0];
                break;
              }
            }

            // Extract links
            const linkElement = element.querySelector('a');
            let ticketLink = linkElement?.href || '';
            if (ticketLink && !ticketLink.startsWith('http')) {
              ticketLink = `https://tix.africa${ticketLink}`;
            }

            // Extract image
            const imageElement = element.querySelector('img');
            const imageUrl =
              imageElement?.src || imageElement?.getAttribute('data-src') || '';

            // Create event object
            const event = {
              eventName: eventName.substring(0, 200), // Limit length
              date: dateText,
              location: location || 'Nigeria',
              price,
              ticketLink,
              category: 'Entertainment',
              description: allText.substring(0, 500),
              imageUrl,
            };

            scrapedEvents.push(event);
            console.log(
              `Scraped event ${index + 1}: ${eventName.substring(0, 50)}...`,
            );
          } catch (error) {
            console.warn(`Error scraping event ${index}:`, error);
          }
        });

        return scrapedEvents;
      });

      this.logger.log(`Scraped ${events.length} events from Tix.africa`);

      // Log some sample events for debugging
      if (events.length > 0) {
        this.logger.debug(
          `Sample events: ${JSON.stringify(events.slice(0, 2), null, 2)}`,
        );
      }

      // Step 2: Scrape detailed information for each event
      const detailedEvents: ScrapedEventDetailed[] = [];

      for (let i = 0; i < events.length; i++) {
        try {
          this.logger.log(
            `Scraping event ${i + 1}/${events.length}: ${events[i].eventName}`,
          );

          const detailedEvent = await this.scrapeEventDetails(page, events[i]);
          if (detailedEvent) {
            detailedEvents.push(detailedEvent);
          }

          await this.delay(2000);
        } catch (error) {
          this.logger.warn(
            `Failed to scrape event details for ${events[i].eventName}:`,
            error.message,
          );
        }
      }

      // Step 3: Process and save events - FIXED TYPE ISSUE
      let successCount = 0;
      for (const detailedEvent of detailedEvents) {
        // detailedEvent is now properly typed as ScrapedEventDetailed
        try {
          const processedEvent = await this.processEvent(detailedEvent);
          await this.eventsService.create(processedEvent);
          successCount++;
          this.logger.debug(
            `Saved event: ${detailedEvent.eventName.substring(0, 50)}...`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to save event ${detailedEvent.eventName}:`,
            error.message,
          );
        }
      }

      this.logger.log(
        `Successfully processed ${successCount}/${events.length} events from Tix.africa`,
      );
    } catch (error) {
      this.logger.error('Error scraping Tix.africa:', error.message);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async processEvent(
    scrapedEvent: ScrapedEventDetailed,
  ): Promise<CreateEventDto> {
    return {
      eventName: scrapedEvent.eventName,
      description:
        scrapedEvent.description ||
        `${scrapedEvent.eventName} - Event from Tix.africa`,
      date: this.parseDate(scrapedEvent.date).toISOString(),
      location: scrapedEvent.location || 'Nigeria',
      venue: scrapedEvent.location || 'TBA',
      price: this.parsePrice(scrapedEvent.price).toString(),
      ticketLink: scrapedEvent.ticketLink,
      category: this.determineCategory(
        scrapedEvent.eventName,
        scrapedEvent.description,
      ),
      source: 'tix.africa',
      imageUrl: scrapedEvent.imageUrl,
      isActive: true,
    };
  }

  private parseDate(dateString: string): Date {
    if (!dateString) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    }

    try {
      // Clean up the date string
      const cleanDate = dateString.replace(/^\w+,?\s*/, ''); // Remove day names

      // Try parsing with native Date constructor first
      let parsedDate = new Date(cleanDate);

      // If that fails, try manual parsing
      if (isNaN(parsedDate.getTime())) {
        const patterns = [
          /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
          /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}),? (\d{4})/i,
          /(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{4})/i,
        ];

        for (const pattern of patterns) {
          const match = dateString.match(pattern);
          if (match) {
            parsedDate = new Date(match[0]);
            if (!isNaN(parsedDate.getTime())) {
              break;
            }
          }
        }
      }

      // Ensure the date is not in the past (unless it's very recent)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      if (parsedDate < weekAgo) {
        // If date seems too old, assume it's next year
        parsedDate.setFullYear(now.getFullYear() + 1);
      }

      return parsedDate;
    } catch (error) {
      this.logger.warn(`Failed to parse date: ${dateString}`);
    }

    // Fallback to 30 days from now
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 30);
    return fallbackDate;
  }

  private parsePrice(priceString: string): number {
    if (!priceString || priceString.toLowerCase().includes('free')) {
      return 0;
    }

    // Remove currency symbols and extract numbers
    const cleanPrice = priceString.replace(/[₦NGN\s]/g, '');
    const priceMatch = cleanPrice.match(/[\d,]+/);

    if (priceMatch) {
      return parseInt(priceMatch[0].replace(/,/g, ''), 10);
    }

    return 0;
  }

  private determineCategory(
    eventName: string,
    description: string = '',
  ): string {
    const text = `${eventName} ${description}`.toLowerCase();

    const categories = {
      Concert: [
        'concert',
        'music',
        'live',
        'performance',
        'band',
        'artist',
        'afrobeats',
        'amapiano',
        'album',
        'tour',
        'acoustic',
      ],
      Conference: [
        'conference',
        'summit',
        'seminar',
        'workshop',
        'business',
        'tech',
        'startup',
        'networking',
        'professional',
      ],
      Party: [
        'party',
        'club',
        'nightlife',
        'celebration',
        'birthday',
        'december',
        'nye',
        'new year',
        'rooftop',
      ],
      Festival: [
        'festival',
        'carnival',
        'cultural',
        'food',
        'art',
        'film',
        'music festival',
      ],
      Sports: [
        'sports',
        'football',
        'basketball',
        'match',
        'game',
        'tournament',
        'championship',
      ],
      Comedy: ['comedy', 'standup', 'comedian', 'funny', 'laugh', 'humor'],
      Theater: ['theater', 'theatre', 'drama', 'play', 'stage', 'musical'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category;
      }
    }

    return 'Entertainment';
  }

  private async scrapeEventDetails(
    page: puppeteer.Page,
    basicEvent: ScrapedEventBasic,
  ): Promise<ScrapedEventDetailed | null> {
    try {
      await page.goto(basicEvent.originalUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      await this.delay(2000);

      const eventDetails = await page.evaluate((basicEvent) => {
        const getText = (selector: string): string => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() || '';
        };

        // Extract detailed information
        const dateTimeText = getText(
          '[data-testid="event-date"], .event-date, .date-time',
        );
        const locationText = getText(
          '[data-testid="event-location"], .event-location, .location',
        );
        const priceText = getText(
          '[data-testid="event-price"], .event-price, .price',
        );
        const aboutText = getText(
          '[data-testid="event-description"], .event-description, .about-event',
        );

        const ticketButton = document.querySelector(
          '[data-testid="buy-ticket"], .buy-ticket, a[href*="ticket"]',
        );
        const timeMatch = dateTimeText.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))/);

        return {
          ...basicEvent,
          date: dateTimeText || '',
          time: timeMatch ? timeMatch[0] : '',
          duration: '',
          location: locationText || '',
          venue: locationText || '',
          price: priceText || 'Free',
          ticketLink:
            ticketButton?.getAttribute('href') || basicEvent.originalUrl,
          category: 'Entertainment',
          description: aboutText?.substring(0, 200) + '...' || '',
          aboutEvent: aboutText || '',
          bannerUrl: '',
          organizer: '',
          contact: {},
          directionsUrl: '',
          ticketTypes: [],
          tags: [],
        };
      }, basicEvent);

      eventDetails.category = this.determineCategory(
        eventDetails.eventName,
        eventDetails.aboutEvent,
      );
      return eventDetails as ScrapedEventDetailed;
    } catch (error) {
      this.logger.warn(
        `Failed to scrape details for ${basicEvent.eventName}:`,
        error.message,
      );
      return null;
    }
  }
}
