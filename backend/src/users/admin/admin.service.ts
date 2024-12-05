import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { Role } from 'src/auth/decorators/role.decorator';
import { Users } from '../users.schema';

@Injectable()
export class AdminService {
    constructor(private  usersService: UsersService) {}
    //GET ALL USERS
    async findUsersByFilters(username?: string, role?: Role): Promise<Users[]> {
        return this.usersService.findUsers(username, role);
    }
}
