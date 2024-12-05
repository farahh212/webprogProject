
import { Injectable, NotFoundException, Inject, forwardRef ,InternalServerErrorException,BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { courseDocument, Courses } from './courses.schema';
import { Module } from '../modules/modules.schema';
import { Model } from 'mongoose';
import { CreateCourseDto } from './dto/CreateCourse.dto';
import { UpdateCourseDto } from './dto/UpdateCourse.dto';
import { ModulesService } from '../modules/modules.service';
import { CreateModuleDto } from 'src/modules/dto/CreateModule.dto';
import * as mongoose from 'mongoose'; // Import mongoose to use ObjectId
import { moduleDocument } from '../modules/modules.schema';
import { userDocument } from 'src/users/users.schema';
import { Users } from 'src/users/users.schema';
import { HydratedDocument } from 'mongoose';
import { ProgressService } from 'src/progress/progress.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Courses.name) private readonly courseModel: Model<courseDocument>,
    @InjectModel(Module.name) private readonly moduleModel: Model<moduleDocument>,
    @InjectModel(Users.name) private readonly userModel: Model<userDocument>,
      @Inject(forwardRef(() => ModulesService)) private readonly modulesService: ModulesService,
      @Inject(forwardRef(() => ProgressService)) private readonly progressService: ProgressService,
                // Inject ModulesService with forwardRef
    ) {}
    
  //GET ALL COURSES //PUBLIC  
  async findAll(): Promise<{ title: string; description: string }[]> {
    return this.courseModel
      .find({ Unavailable: false }) // Filter to get only available courses
      .select('title description')  // Select only title and description fields
      .exec();
  }
    

 //FIND COURSE BY COURSE_CODE 
  async findOne(course_code: string): Promise<courseDocument> {
    const course = await this.courseModel
      .findOne({ course_code, Unavailable: false }) // Add filter for availability
      .exec();
  
    if (!course) {
      throw new NotFoundException(`Course with course code ${course_code} not found or unavailable`);
    }
  
    return course;
  }

  //GET: find course by course code
  async findCourseByTitle(title: string): Promise<courseDocument> {
    const course = await this.courseModel.findOne({title,Unavailable: false}).exec();
    if (!course) {
      throw new NotFoundException(`Course with title ${title} not found`);
    }
    return course;
  }

  //get course by objectId
  async getcoursebyid(ObjectId: mongoose.Types.ObjectId): Promise<courseDocument> {
    const course = await this.courseModel.findById({ObjectId,Unavailable: false}).exec();
    if (!course) {
      throw new NotFoundException(`course with Object id ${ObjectId} not found`);
    }
    return course;
  }


  //CREATE: intructor create course
  async create( username: string,createCourseDto: CreateCourseDto): Promise<courseDocument> {
    const newCourse = new this.courseModel(createCourseDto); // Step 1: Create the new course
    newCourse.created_at = new Date();
    const savedCourse = await newCourse.save();

    // Step 2: Find the instructor by their username
    const instructor = await this.userModel.findOne({ username }).exec();
    if (!instructor) {
      throw new NotFoundException(`Instructor with username ${username} not found`);
    }

    // Step 3: Add the new course's ObjectId to the instructor's courses array
    instructor.courses.push(savedCourse._id);  // Cast _id to the correct type

    // Step 4: Save the updated instructor
    await instructor.save();

    // Step 5: Return the newly created course
    return savedCourse;
  }

 // Update an existing course by ID
  async update(course_code: string, updateCourseDto: UpdateCourseDto): Promise<courseDocument> {
    const updatedCourse = await this.courseModel
      .findOneAndUpdate({ course_code,Unavailable: false}, updateCourseDto, { new: true })
      .exec();
  
    if (!updatedCourse) {
      throw new NotFoundException(  `Course with Course code${course_code} not found`);
    }
    return updatedCourse;
  }

 //GET: find course by module
async findCourseByModuleId(moduleId:mongoose.Types.ObjectId):Promise<courseDocument>{
  const course = await this.courseModel.findOne({ modules: {$in: [moduleId]},Unavailable: false })
  return course;
}

//GET: modules for a course for a student
async getModulesForCourseStudent(course_code: string, username: string): Promise<moduleDocument[]> {
  // Step 1: Fetch the student by their username
  const student = await this.userModel.findOne({ username }).exec();
  if (!student) {
    throw new NotFoundException(`Student with username ${username} not found`);
  }

  // Step 2: Fetch the course by its code
  const course = await this.courseModel.findOne({ course_code: course_code,Unavailable: false }).exec();
 // await this.findOne(course_code);
  if (!course) {
    throw new NotFoundException(`Course with code ${course_code} not found`);
  }

  // Step 3: Fetch all modules for the course
  const modules = await this.moduleModel.find({
    _id: { $in: course.modules }, // Match ObjectIds in `course.modules`
  }).exec();

  // Step 4: Filter the modules based on the student's level and outdated status
  const validModules = modules.filter(module => {
    
    // Get the student's level for the current course using the course _id
    const studentLevel = student.studentLevel.get(course._id);

    // Return modules that match the student's level and are not outdated
    return studentLevel === module.level && !module.isOutdated;
});

  return validModules;
}


//GET: modules for a course for an instructor
async getModulesForCourseInstructor(course_code: string): Promise<moduleDocument[]> {
  const course = await this.findOne(course_code);

  if (!course) {
    throw new NotFoundException(`Course with code ${course_code} not found`);
  }

  // Fetch all modules by their ObjectIds
  const modules = await this.moduleModel.find({
    _id: { $in: course.modules }, Unavailable: false 
  }).exec();
 
  return modules;
}

//PUT: add module to a course
async addModuleToCourse(courseCode: string, createModuleDto: CreateModuleDto): Promise<courseDocument> {
  // Create new module and save it to the database
  const newModule = await this.modulesService.create(createModuleDto);

  // Check if the module was created successfully and has an _id
  if (!newModule || !newModule._id) {
    throw new Error('Failed to create the module.');
  }

  // Find the course by course code
  const course = await this.courseModel.findOne({ course_code: courseCode ,Unavailable: false}).exec();
  if (!course) {
    throw new NotFoundException(`Course with Course code ${courseCode} not found`);
  }
  course.modules.push(newModule._id);

  // Save the updated course document
  const updatedCourse = await course.save();

  return updatedCourse;
}

//PUT: remove module from array of modules in specific course
async DeleteModuleFromCourse(courseCode: string, title:string): Promise<courseDocument> {
  const deletedModule= await this.modulesService.delete(title);
  // Use $pull to remove the moduleId from the modules array atomically
  const updatedCourse = await this.courseModel.findOneAndUpdate({ course_code: courseCode,Unavailable: false }, { $pull: { modules: deletedModule._id} },{ new: true } ).exec();
  if (!updatedCourse) {
    throw new NotFoundException(`Course with course code ${courseCode} not found`);
  }

  return updatedCourse;  // Return the updated course
}

//GET: find course outdated attribute by course code
async findOutdated(course_code: string): Promise<boolean> {
  const course = await this.courseModel.findOne({ course_code ,Unavailable: false}, { isOutdated: 1, _id: 0 }) 
  if (!course) {
    throw new NotFoundException(`Course with course code ${course_code} not found`);
  }

  return course.isOutdated;
}

//PUT: change outdated of course
async toggleOutdated(course_code: string): Promise<courseDocument> {
  const course = await this.courseModel.findOne({ course_code,Unavailable: false }).exec();
  if (!course) {
    throw new NotFoundException(`Course with course code ${course_code} not found`);
  }
  course.isOutdated = !course.isOutdated;
  return await course.save();
}


// Get Average score of a specific module 
async getAverageScoreForCourse(course_code: string): Promise<number> {
  // Step 1: Find the course and deeply populate nested fields
  const course = await this.courseModel
    .findOne({ course_code,  Unavailable: false })
    .populate({
      path: 'modules', // Populate modules
      populate: {
        path: 'quizzes', // Populate quizzes within modules
        populate: {
          path: 'responses', // Populate responses within quizzes
          select: 'score', // Only fetch the 'score' field
        },
      },
    })
    .exec();

  if (!course) {
    throw new NotFoundException(`Course with code ${course_code} not found`);
  }

  // Step 2: Traverse through populated modules, quizzes, and responses
  let totalScore = 0;
  let totalResponses = 0;

  course.modules.forEach((module: any) => {
    module.quizzes.forEach((quiz: any) => {
      quiz.responses.forEach((response: any) => {
        totalScore += response.score; // Accumulate scores
        totalResponses += 1; // Count responses
      });
    });
  });

  // Step 3: Calculate average and return
  if (totalResponses === 0) {
    return 0; // No responses, average is 0
  }

  const averageScore = totalScore / totalResponses;
  return averageScore;
}

//GET AVERAGE RATING
async getTotalRating( ObjectId: mongoose.Types.ObjectId): Promise<number> {
  const course = await this.courseModel.findById({ObjectId, Unavailable: false});
  return course.totalRating;
 }
 
 //SET RATING,TOTAL,AVERAGE
 async setRating(ObjectId: mongoose.Types.ObjectId,score:number): Promise<void> {
   const course = await this.courseModel.findById({ObjectId, Unavailable: false});
   course.totalRating = course.totalRating + score;
   course.totalStudents += 1;
   course.averageRating = course.totalRating/course.totalStudents;
 }

 
async getNonOutdatedCoursesForStudent(username: string): Promise<Courses[]> {
  // Find the student by username
  const student = await this.userModel.findOne({ username }).exec();
  if (!student) {
    throw new Error('Student not found');
  }

  // Retrieve courses based on their ObjectIds
  const courses: Courses[] = [];
  for (const courseId of student.courses) {
    const course = await this.getcoursebyid(courseId); // Use existing method
    if (course && !course.isOutdated && !course.Unavailable) {
      courses.push(course);
    }
  }

  return courses;
}
//GET COURSE FOR SPECIFIC MODULE TITLE
async getCourseForModule (moduleTitle:string): Promise<courseDocument>{
 const module=await this.modulesService.findByTitle(moduleTitle)as moduleDocument;;

 return await this.courseModel.findOne({ modules: module._id }).exec();

}

//DELETE COURSE (MAKE IT UNAVAILABLE)

async deleteCourse(course_code: string): Promise<{ message: string }> {
  // Fetch all progress records for the course
  const progressRecords = await this.progressService.findAllByCourse(course_code);

  // Check if all progress records have 100% completion
  const allCompleted = progressRecords.every(progress => progress.completion_percentage === 100);

  if (!allCompleted) {
    throw new BadRequestException('Cannot delete course until all students have 100% completion');
  }

  // Mark course as unavailable
  const updatedCourse = await this.courseModel.findOneAndUpdate(
    { course_code },
    { unavailable: true },
    { new: true } // Return the updated document
  );

  if (!updatedCourse) {
    throw new NotFoundException('Course not found');
  }

  return { message: 'Course marked as unavailable successfully' };
}


}