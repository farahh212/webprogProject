import { Controller, Get, Post, Body, Param, Put, Delete,NotFoundException  } from '@nestjs/common';
import { UsersService } from './users.service';
import * as mongoose from 'mongoose';
import { Courses } from 'src/courses/courses.schema';
import { Users, UsersSchema } from './users.schema';
import { userDocument } from './users.schema';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';
//import { SearchUserDto } from './dto/search-user.dto';
import {  Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { SearchUserDto } from './dto/SearchUser.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
     //GET: get array of courses for a speicifc user
  //   @Get(':username')
  // async findCoursesArray(@Param('username') username: string): Promise<Courses[]> {
  //   return this.usersService.findCoursesArray(username);
  // }

  //GET USER BY username
  @Get(':username')
  async findUserByUsername(@Param('username') username: string): Promise<userDocument> {
    return this.usersService.findUserByUsername(username);
  }
 //GETT ALL USERS ENROLLED IN A COURSE
 @Get() 
   async getEnrolledStudents(@Param('objectId')objectId: mongoose.Types.ObjectId): Promise<string[]>{
     return this.usersService.getEnrolledStudents(objectId);
   }


//GET API for searching users, with certain 
      //constraints depending on whether the user is logged in or not

  // GET API to search users
  @Get('search')
 // @UseGuards(JwtAuthGuard)  // Use the JwtAuthGuard to protect the route (if you want to allow only authenticated users to search)
  async searchUsers(
    @Req() req,  // Request object to access the authenticated user's data
    @Query() searchUserDto: SearchUserDto,  // Search filters
  ) {
    const loggedInUserId = req.user._id;

    // Perform search with the filters and the logged-in user context
    return this.usersService.searchUsers(loggedInUserId, searchUserDto);
  }


  // GET API to search users without authentication (public search for instructors only)
  @Get('search/public')
  async searchPublicUsers(
    @Query() searchUserDto: SearchUserDto,  // Search filters
  ) {
    // If not logged in, you can only filter for instructors
    if (searchUserDto.role && searchUserDto.role !== 'instructor') {
      throw new HttpException('You are not logged in to search for students.',HttpStatus.FORBIDDEN);
    }

    // Perform search for instructors only
    return this.usersService.searchUsers(null, searchUserDto);
  }
}