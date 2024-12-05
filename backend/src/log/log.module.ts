import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogController } from './log.controller';
import { LogsService } from './log.service';
import { Log, LogSchema } from './log.schema'; // Import your Log schema

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]), // Register the Log schema with Mongoose
  ],
  controllers: [LogController],
  providers: [LogsService], // Add your service
})
export class LogModule {}
