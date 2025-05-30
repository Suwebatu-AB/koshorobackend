// src/dto/event.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CoordinatesDto {
  @ApiProperty({ example: 6.5244 })
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: 3.3792 })
  @IsOptional()
  lng?: number;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Afrobeats Concert 2025' })
  @IsString()
  eventName: string;

  @ApiProperty({ example: '2025-12-25T20:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '8:00 PM' })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional({ example: '3 hours' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ example: 'Lagos, Nigeria' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 'Eko Convention Centre' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Lagos State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '5000' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ example: 'https://tix.africa/buy-ticket/123' })
  @IsOptional()
  @IsString()
  ticketLink?: string;

  @ApiProperty({ example: 'Concert' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Amazing Afrobeats concert...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Join us for an unforgettable night...' })
  @IsOptional()
  @IsString()
  aboutEvent?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({ example: 'tix.africa' })
  @IsString()
  source: string;

  @ApiPropertyOptional({ example: 'https://tix.africa/discover/event-slug' })
  @IsOptional()
  @IsString()
  originalUrl?: string;

  @ApiPropertyOptional({ example: 'event-slug' })
  @IsOptional()
  @IsString()
  eventSlug?: string;

  @ApiPropertyOptional({ example: 'Event Organizers Ltd' })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  coordinates?: {
    lat: number;
    lng: number;
  };

  @ApiPropertyOptional({ example: 'https://maps.google.com/directions' })
  @IsOptional()
  @IsString()
  directionsUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['music', 'afrobeats', 'concert'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  ticketTypes?: Array<{
    name: string;
    price: string;
    description?: string;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Updated Event Name' })
  @IsOptional()
  @IsString()
  eventName?: string;

  @ApiPropertyOptional({ example: '2025-12-22T20:00:00Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'New Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '15,000 NGN' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ example: 'https://tix.africa/event/456' })
  @IsOptional()
  @IsString()
  ticketLink?: string;

  @ApiPropertyOptional({ example: 'Festival' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Updated Organizer' })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['updated', 'tags'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'New Venue' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ example: 'Abuja' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'FCT' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class EventQueryDto {
  @ApiPropertyOptional({ example: 'Concert' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Lagos State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '2025-12-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Afrobeats' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'date', default: 'date' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'date';

  @ApiPropertyOptional({ example: 'asc', default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
