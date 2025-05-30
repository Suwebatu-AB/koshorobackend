// src/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from '../dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async findAll(query: EventQueryDto): Promise<{
    events: Event[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      category,
      city,
      state,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'asc',
    } = query;

    // Build filter object
    const filter: any = { isActive: true };

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [events, total] = await Promise.all([
      this.eventModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.eventModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      events,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async findBySource(source: string): Promise<Event[]> {
    return this.eventModel.find({ source }).exec();
  }

  async findUpcomingEvents(limit: number = 10): Promise<Event[]> {
    return this.eventModel
      .find({
        isActive: true,
        date: { $gte: new Date() },
      })
      .sort({ date: 1 })
      .limit(limit)
      .exec();
  }

  async findEventsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Event[]> {
    return this.eventModel
      .find({
        isActive: true,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: 1 })
      .exec();
  }

  async findEventsByLocation(
    city: string,
    limit: number = 10,
  ): Promise<Event[]> {
    return this.eventModel
      .find({
        isActive: true,
        city: { $regex: city, $options: 'i' },
      })
      .sort({ date: 1 })
      .limit(limit)
      .exec();
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return updatedEvent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async bulkCreate(events: CreateEventDto[]): Promise<Event[]> {
    const createdEvents = await this.eventModel.insertMany(events);
    return createdEvents.map((event) => event.toObject() as Event);
  }

  async getEventStats(): Promise<{
    totalEvents: number;
    activeEvents: number;
    eventsBySource: any[];
    eventsByCategory: any[];
    upcomingEvents: number;
  }> {
    const [
      totalEvents,
      activeEvents,
      eventsBySource,
      eventsByCategory,
      upcomingEvents,
    ] = await Promise.all([
      this.eventModel.countDocuments().exec(),
      this.eventModel.countDocuments({ isActive: true }).exec(),
      this.eventModel
        .aggregate([
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.eventModel
        .aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.eventModel
        .countDocuments({
          isActive: true,
          date: { $gte: new Date() },
        })
        .exec(),
    ]);

    return {
      totalEvents,
      activeEvents,
      eventsBySource,
      eventsByCategory,
      upcomingEvents,
    };
  }

  // Helper method to check if event already exists (to avoid duplicates)
  async eventExists(
    eventName: string,
    date: Date,
    location: string,
  ): Promise<boolean> {
    const event = await this.eventModel
      .findOne({
        eventName: { $regex: eventName, $options: 'i' },
        date,
        location: { $regex: location, $options: 'i' },
      })
      .exec();

    return !!event;
  }
}
