import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { courseDocument } from 'src/courses/courses.schema';
import { Courses} from 'src/courses/courses.schema';
import { CoursesService } from 'src/courses/courses.service';
import { Users } from '../users.schema';
import { UsersSchema } from '../users.schema';
import { UsersService } from '../users.service';

@Injectable()
export class StudentService {

    constructor(
        @InjectModel(Users.name) private readonly userModel: Model<Users>, //msh motakeda
        @InjectModel(Courses.name) private readonly courseModel: Model<Courses>,
        @Inject(forwardRef(() => CoursesService)) private readonly coursesService: CoursesService,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
    ){}

    //GET: all courses student enrolled in and not outdated                 DONE EXCEPT USERNAME NEED TO GET FROM TOKEN
 //   async getCoursesForStudent(): Promise<Courses[]> {
        // Step 1: Get the courses array for the user
  //      const coursesArray = await this.usersService.findCoursesArray(this.userModel.username);
      
        // Step 2: Fetch all courses by their ObjectIds
   //     const courses = await this.courseModel.find({
    //      _id: { $in: coursesArray }, // Match ObjectIds from coursesArray
   //     }).exec();
      
        // Step 3: Filter non-outdated courses
    //    const validCourses = courses.filter((course) => !course.isOutdated);
      
  //      return validCourses;
    //  }
}
