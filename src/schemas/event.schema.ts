// src/schemas/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ default: 'Free' })
  price: string;

  @Prop()
  ticketLink?: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true, enum: ['tix.africa', 'eventbrite', 'instagram'] })
  source: string;

  @Prop()
  originalUrl?: string;

  @Prop()
  organizer?: string;

  @Prop({ type: Object })
  coordinates?: {
    lat: number;
    lng: number;
  };

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  tags?: string[];

  @Prop()
  venue?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop({ default: 'Nigeria' })
  country: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
