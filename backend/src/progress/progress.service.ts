import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Progress , ProgressDocument } from './progress.schema';
import { CoursesService } from 'src/courses/courses.service';
import { Courses, CoursesSchema } from 'src/courses/courses.schema';
import { CreateProgressDTo } from './dto/createProgress.dto';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.schema';
import Module from 'module';
import { moduleDocument } from 'src/modules/modules.schema';
import { Quiz } from 'src/quizzes/quizzes.schema';
import { QuizzesService } from 'src/quizzes/quizzes.service';


@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
    @InjectModel(Courses.name) private courseModel: Model<Courses>,
    @InjectModel(Module.name) private readonly moduleModel: Model<moduleDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
    
     private coursesService: CoursesService,
     private readonly quizzesService: QuizzesService, //private usersService: UsersService, private quizService:QuizzesService
  ) {}

    async findAll():Promise<Progress[]>{  //find all progresses 
        let progresses= await this.progressModel.find();
        return progresses;
    }
    async findAllByCourse(course_code: string): Promise<Progress[]> {  //all progress for a specific course (hasa instructers )
      return await this.progressModel.find({ course_code }); // Correct filter
    }
    
  
  async findbyUsername(Username: string): Promise<Progress[]> {  // for instucters and students?? wala instucters bas
    return await this.progressModel.find({ Username });
  }
  

  async findByUsernameAndCourseCode(Username: string, course_code: string): Promise<Progress> { //instructer beyshoof progress of a student 
    return await this.progressModel.findOne({ Username, course_code });
}
  async findbyCourseCode(course_code: string):Promise<Progress>{ //for a student finding a progress in a course 
    return await this.progressModel.findOne({course_code}); 
    }


async update(course_code: string,Username: string,updateData: { completion_percentage: number; last_accessed: Date }): Promise<Progress> {
        return await this.progressModel.findOneAndUpdate(
          { Username, course_code },
          updateData,
          { new: true }
        );
      } //beyupdate with new complettion percentage no guard

      //createeee
      async create(progressData: CreateProgressDTo): Promise<Progress> {
        const createdProgress = new this.progressModel(progressData);
        return createdProgress.save();  // Save to the database
      }



//deletee mmkn admin 
async delete(course_code: string, Username: string): Promise<Progress> {
        return await this.progressModel.findOneAndDelete({ course_code, Username });
}

//DELETE Progress by username
async deleteProgressByUsername(Username: string) {
  await this.progressModel.findOneAndDelete({ Username });
}
    
     

      //same as above bas return call findby coursecode and return lenghth of array. number of students enrolled. getStudentEnrolled
      async findNumberOfStudentsEnrolled(course_code: string): Promise<number> { //hasa no guard
        const students = await this.findAllByCourse(course_code);
        return students.length;
      }
      async findAllStudentsEnrolled(course_code: string): Promise<string[]> { //maybe instructer and admin
        const students = await this.findAllByCourse(course_code);
        const usernames = students.map(student => student.Username);

        // Return the array of usernames
        return usernames;
       
      }
      

      
      
      
      
      //completed: the array aboth, filter who finished. kol student check if completetion is 100 . getStudentsCOmpleted
      async findAllStudentsCompleted(course_code: string): Promise<Progress[]> {
        const students = await this.findAllByCourse(course_code); // Get all progress documents for the course
        
        // Filter students with completion_percentage = 100
        const completedStudents = students.filter(student => student.completion_percentage === 100);
      
        return completedStudents; 
      }
      


      // get length of modules array mn course code(total number of modules), how many modules completed per user needed . getModulesCompleted
      async getTotalModules(course_code: string): Promise<number> {
        const total= await this.coursesService.getModulesForCourse(course_code); 
        return total.length;// Call the method from CoursesService
      }

      async getTotalModulesCompleted(course_code: string, Username: string):Promise<number>{
        const studentProgress = await this.progressModel.findOne({ Username, course_code });

        if (!studentProgress) {
          throw new Error('Student progress not found');
        }
         // Get the total number of modules for the course
    const totalModules = await this.getTotalModules(course_code);  // This calls getModulesForCourse from CoursesService

    // Calculate the number of completed modules based on completion_percentage
    const completedModules = Math.round((studentProgress.completion_percentage / 100) * totalModules);

    return completedModules;
  
      }

      async setCompletionPercentage(Username: string): Promise<number[]>{
        let CompPercentage: number[];
        const student= await this.userModel.findOne({Username}).exec();
        const courses= await this.courseModel.find({_id:{ $in:student.courses}}).exec();
        let ModulesCompleted=0;
        

        for(const course of courses){
            const modules= await this.moduleModel.find({_id:{ $in:course.modules}}).exec();
            if(modules.length==0){
              await this.progressModel.findOneAndUpdate(
                { Username, course_code: course._id }, // Ensure you have course._id if tracking per course
                { completion_percentage: 0, last_accessed: new Date() },
                { upsert: true },
              );
            CompPercentage.push(0);
            }
            else{
                          var noOfModules = modules.length;
            for(const module of modules){
                const quizzes= await this.quizModel.find({_id:{ $in: module.quizzes}}).exec();
                if(quizzes.length>0){
                    const quiz = quizzes[0];
                    const checkStat=await this.quizzesService.checkStudentQuizStatus( quiz._id, Username);
                    if(checkStat===true){
                        ModulesCompleted++;
                    }
                  }
                }
            

            const completionPercentage = (ModulesCompleted / noOfModules) * 100 ;
            CompPercentage.push(completionPercentage);
            await this.progressModel.findOneAndUpdate(
                { Username, course_code: course._id }, // Ensure you have course._id if tracking per course
                { completion_percentage: completionPercentage, last_accessed: new Date() },
                { upsert: true },
                  );
        }
      
      }
      return await CompPercentage;
        
      }

      
    /*  async setCompletionPercentage(username: string): Promise<void> {
        // Step 1: Find the user by username
        const user = await this.userModel.findOne({ username }).exec();
      
        if (!user) {
          throw new Error('User not found');
        }
      
        let completedQuizCount = 0;
      
        // Step 2: Find all courses associated with the user
        const courses = await this.courseModel.find({ _id: { $in: user.courses } }).exec();
      
        // Step 3: Loop through each course
        for (const course of courses) {
          // Step 4: Get modules for the course
          const modules = await this.coursesService.getModulesForCourse(course.course_code);
      
          // Step 5: Loop through each module to check the quizzes
          for (const module of modules) {
            // Step 6: Find quizzes for the module
            const quizzes = await this.quizService.findByModuleTitle(module.title);
      
            if (!quizzes || quizzes.length === 0) {
              continue; // Skip if no quizzes exist for this module
            }
      
            // Step 7: Loop through each quiz and check for responses
            for (const quiz of quizzes) {
              // Step 8: Populate the responses field in the quiz (assuming responses is an array of ObjectIds referencing User model)
              const populatedQuiz = await this.quizModel.find({ moduleTitle: module.title })
                .populate({
                  path: 'responses', // Assuming 'responses' is the field to populate
                  match: { username: username },  // Match responses where the username is the same as the student
                })
                .exec();  // Ensure the query is executed
      
              // Step 9: Check if the populated responses contain the user's response
              if (populatedQuiz && populatedQuiz[0] && populatedQuiz[0].responses.length > 0) {
                completedQuizCount++; // Increment the completed quizzes count if a response exists for this student
              }
            }
          }
        }
      
        // Step 10: Calculate the completion percentage based on completed modules
        const totalModulesCount = courses.reduce((count, course) => count + course.modules.length, 0); // Assuming each course has a 'modules' field
        const completionPercentage = totalModulesCount > 0 ? (completedQuizCount / totalModulesCount) * 100 : 0;
      
        // Step 11: Update the progress model with the new completion percentage
        await this.progressModel.findOneAndUpdate(
          { username, course_code: courses[0].course_code }, // Adjust based on how you store progress
          { completion_percentage: completionPercentage },
          { new: true, upsert: true } // Ensure the record is created if it doesn't exist
        );
      }*/
      

      }
      

      



      

    /*async updateCompletionPercentage(username: string, course_code: string): Promise<void> {
  // Step 1: Find the user and populate courses, modules, and quizzes
  const user = await this.userModel
    .findOne({ Username: username })
    .populate({
      path: 'courses', // Populate courses array
      match: { 'course_code': course_code }, // Match the course code to get a specific course
      populate: {
        path: 'modules', // Populate modules inside each course
        populate: {
          path: 'quizzes', // Populate quizzes inside each module
          populate: {
            path: 'responses', // Populate responses inside each quiz
            select: 'Username score', // Only fetch necessary fields
          },
        },
      },
    })
    .exec();

  if (!user) {
    throw new NotFoundException(`User with username ${username} not found`);
  }

  // Step 2: Find the specific course for the user
  const course = user.courses.find(c => c.course_code === course_code); // Get the specific course by course_code

  if (!course) {
    throw new NotFoundException(`Course with code ${course_code} not found for user ${username}`);
  }

  // Step 3: Calculate the number of completed modules
  let totalModules = 0;
  let completedModules = 0;

  // Loop through the modules and check for completion
  course.modules.forEach((module: any) => {
    totalModules++; // Count total modules
    let isCompleted = false;

    // Loop through the quizzes of the module
    module.quizzes.forEach((quiz: any) => {
      const response = quiz.responses.find((response: any) => response.Username === username);
      if (response && response.score !== undefined) {
        // You can check if the score is non-zero or meets a certain threshold to consider as completed
        isCompleted = true; // If a response exists, the module is considered completed
      }
    });

    if (isCompleted) {
      completedModules++; // Increment the completed modules count
    }
  });

  // Step 4: Calculate the completion percentage
  const completionPercentage = (completedModules / totalModules) * 100;

  // Step 5: Update the progress document (no return needed, as method is void)
  await this.progressModel.findOneAndUpdate(
    { username, course_code },
    { completion_percentage: completionPercentage },
    { new: true }
  );
}*/

            
    
          
      
      
  

      
      


