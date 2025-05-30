// src/schemas/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  time?: string;

  @Prop()
  duration?: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  venue?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop({ default: 'Nigeria' })
  country: string;

  @Prop({ default: 'Free' })
  price: string;

  @Prop()
  ticketLink?: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description?: string;

  @Prop()
  aboutEvent?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  bannerUrl?: string;

  @Prop({ required: true, enum: ['tix.africa', 'eventbrite', 'instagram'] })
  source: string;

  @Prop()
  originalUrl?: string;

  @Prop()
  eventSlug?: string;

  @Prop()
  organizer?: string;

  @Prop({ type: Object })
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };

  @Prop({ type: Object })
  coordinates?: {
    lat: number;
    lng: number;
  };

  @Prop()
  directionsUrl?: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop([String])
  tags?: string[];

  @Prop([Object])
  ticketTypes?: Array<{
    name: string;
    price: string;
    description?: string;
  }>;

  @Prop({ type: Object })
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export type EventDocument = Event & Document;
export const EventSchema = SchemaFactory.createForClass(Event);
