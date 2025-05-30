import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ScrapersModule } from './events/scrapers/scrapers.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/koshoro',
    ),

    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    EventsModule,

    ScrapersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
