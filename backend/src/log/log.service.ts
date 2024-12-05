import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Log } from './log.schema';

@Injectable()
export class LogsService {
    constructor(@InjectModel(Log.name) private logModel: mongoose.Model<Log>) {}

    // Method to get filtered logs for Admin
    async getFilteredLogs(query: any): Promise<Log[]> {
        return this.logModel.find(query).sort({ timestamp: -1 }).exec();
    }

    // You can also add a method for fetching failed login attempts specifically
    async getFailedLoginAttempts(username: mongoose.Types.ObjectId): Promise<Log[]> {
        return this.logModel.find({
            username,
            success: false,
            action: 'Login Failed',
        }).sort({ timestamp: -1 }).exec();
    }
}
