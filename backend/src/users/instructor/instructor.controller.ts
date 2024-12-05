import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { Users, UsersSchema } from '../users.schema';
import { Courses } from 'src/courses/courses.schema';
import { CoursesService } from 'src/courses/courses.service';
import { InstructorService } from './instructor.service';
import { Module, moduleDocument } from 'src/modules/modules.schema';
@Controller('instructor')
export class InstructorController {
    constructor(private readonly instructorService: InstructorService) {}
    //@Get()
    //async getCoursesForStudent(): Promise<Courses[]> {
     //hanroo7 user ngyb array of courses ,loop put courses in array get course by objectId WHEre is outdated false
    // return this.instructorService.getCoursesForStudent();
  //  }

  @Get()
    async getModulesForStudent(): Promise<moduleDocument[]> {
     //hanroo7 user ngyb array of courses ,loop put courses in array get course by objectId WHEre is outdated false
     return this.instructorService.getModulesForStudent();
   }

   // //Get AverageRating  of Instructor
  @Get(':moduleId')
  async getTotalRating(@Param('ObjectId') ObjectId: string): Promise<number> {
    const objectId = new mongoose.Types.ObjectId(ObjectId)
   return await this.instructorService.getTotalRating(objectId);
  }

//SET TOTALRATING TOTALSTUDENTS AVERAGE RATING

@Get()
async setRating(@Param('ObjectId') ObjectId: string, @Param('score')score:number): Promise<void> {
 const objectId = new mongoose.Types.ObjectId(ObjectId)
 await this.instructorService.setRating(objectId,score);
}

@Delete(':username')
async deleteInstructor(@Param('username') username: string): Promise<{ message: string }> {
  return await this.instructorService.deleteInstructor(username);
}


 


}
