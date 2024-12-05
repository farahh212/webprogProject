import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { StudentService } from './student.service';
import { UsersSchema } from '../users.schema';
import { Courses } from 'src/courses/courses.schema';
import { CoursesService } from 'src/courses/courses.service';
import { UpdateUserDto } from '../dto/UpdateUser.dto';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { UsePipes } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) {}

    // Enroll student in a specific course
  @Put(':username/enroll/:courseId')
  async enrollStudentInCourse(@Param('username') username: string,@Param('courseId') courseId: string) {
    return this.studentService.enrollStudentInCourse(username, courseId);
  }


  // GET STUDENT SCORE
  @Get(':username/score/:objectId')
  async getStudentScore(@Param('username') username: string,@Param('objectId') objectId: string,): Promise<number | null> {
    return await this.studentService.getStudentScore(username, new mongoose.Types.ObjectId(objectId));
  }

  // GET STUDENT LEVEL
  @Get(':username/level/:objectId')
  async getStudentLevel(@Param('username') username: string,@Param('objectId') objectId: string,): Promise<string | null> {
    return await this.studentService.getStudentLevel(username,new mongoose.Types.ObjectId(objectId));
  }

  // SET STUDENT SCORE
  @Put(':username/score/:objectId')
  async setStudentScore(@Param('username') username: string,@Param('objectId') objectId: string,@Body('newScore') newScore: number,): Promise<void> {
    await this.studentService.setStudentScore(username, new mongoose.Types.ObjectId(objectId), newScore);
  }
  

   // SET STUDENT Level
   @Put(':username/score/:objectId')
   async setStudentLevel(@Param('username') username: string,@Param('objectId') objectId: string,@Body('newScore') newScore: number,): Promise<void> {
     await this.studentService.setStudentLevel(username, new mongoose.Types.ObjectId(objectId), newScore);
   }

  // GET ALL NOTES OBJECT IDS FOR A SPECIFIC MODULE
  @Get(':username/notes/:moduleId')
  async getAllNotesForModule(@Param('username') username: string,@Param('moduleId') moduleId: string,): Promise<mongoose.Types.ObjectId[] | null> {
    return await this.studentService.getAllNotesForModule(new mongoose.Types.ObjectId(moduleId), username);
  }

 //Delete student, their progress,responses and notes 
  @Delete(':username')
  async deleteStudent(@Param('username') username: string) {
    // Deleting the student and associated data
    await this.studentService.deleteStudentAndRelatedData(username);
    return { message: 'Student and related data deleted successfully.' };
  }
}



