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
  @ApiProperty({ example: 'Afrobeats on the Beach' })
  @IsString()
  eventName: string;

  @ApiProperty({ example: '2025-12-21T20:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Landmark Beach, Lagos' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: '10,000 NGN' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ example: 'https://tix.africa/event/123' })
  @IsOptional()
  @IsString()
  ticketLink?: string;

  @ApiProperty({ example: 'Concert' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Amazing beach concert with top artists' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'tix.africa',
    enum: ['tix.africa', 'eventbrite', 'instagram'],
  })
  @IsEnum(['tix.africa', 'eventbrite', 'instagram'])
  source: string;

  @ApiPropertyOptional({ example: 'https://tix.africa/event/original' })
  @IsOptional()
  @IsString()
  originalUrl?: string;

  @ApiPropertyOptional({ example: 'Event Organizers Ltd' })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['music', 'beach', 'weekend'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Landmark Beach Resort' })
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
