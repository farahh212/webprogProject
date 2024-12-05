import { Controller, Get, Query } from '@nestjs/common';
import { Roles, Role } from 'src/auth/decorators/role.decorator';
import { LogsService } from './log.service';
import mongoose from 'mongoose';

@Controller('log')
export class LogController {

    constructor(private logsService: LogsService) {}

    @Roles(Role.Admin) // Ensure only Admin can access this route
    @Get()
    async getLogs(@Query() query: any) {
        const logs = await this.logsService.getFilteredLogs(query);
        return logs;
    }

    // Method to get failed login attempts for a specific user
    @Roles(Role.Admin)
    @Get('failed')
    async getFailedAttempts(@Query('username') username: string) {
        const logs = await this.logsService.getFailedLoginAttempts(new mongoose.Types.ObjectId(username));
        return logs;
    }
}
