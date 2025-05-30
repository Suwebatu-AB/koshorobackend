// src/events/events.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from '../dto/event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully.' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter events from this date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter events up to this date',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in event name, description, location',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field (default: date)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order: asc or desc (default: asc)',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of events to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming events retrieved successfully.',
  })
  findUpcoming(@Query('limit') limit?: number) {
    return this.eventsService.findUpcomingEvents(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get event statistics' })
  @ApiResponse({
    status: 200,
    description: 'Event statistics retrieved successfully.',
  })
  getStats() {
    return this.eventsService.getEventStats();
  }

  @Get('by-location/:city')
  @ApiOperation({ summary: 'Get events by city' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of events to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Events by location retrieved successfully.',
  })
  findByLocation(@Param('city') city: string, @Query('limit') limit?: number) {
    return this.eventsService.findEventsByLocation(city, limit);
  }

  @Get('by-source/:source')
  @ApiOperation({ summary: 'Get events by source' })
  @ApiResponse({
    status: 200,
    description: 'Events by source retrieved successfully.',
  })
  findBySource(@Param('source') source: string) {
    return this.eventsService.findBySource(source);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get events within a date range' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Events in date range retrieved successfully.',
  })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.eventsService.findEventsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
