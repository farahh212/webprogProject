import { Injectable, NotFoundException, Inject, forwardRef, UseGuards } from '@nestjs/common';
import { Controller, Delete, Param,  InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Module} from './modules.schema';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizzesDocument } from '../quizzes/quizzes.schema';
import { CreateModuleDto } from './dto/CreateModule.dto';
import { UpdateModuleDto } from './dto/UpdateModule.dto';
import { QuizzesService } from '../quizzes/quizzes.service';
import {Question, QuestionsDocument} from '../questions/questions.schema'
import { QuestionsService } from 'src/questions/questions.service';
import { Notes } from 'src/notes/notes.schema';
import { NotesService } from 'src/notes/notes.service';
import { moduleDocument } from './modules.schema';
import { Content } from './content/content.schema';
import { contentDocument } from './content/content.schema';
import { ContentService } from './content/content.service';
//import {quizDocument} from 'src/quizzes/quizzes.service'
//import { QqestionsDocument } from 'src/questions/questions.schema';
import { CoursesService } from 'src/courses/courses.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.schema';
import { userDocument} from 'src/users/users.schema';
import { notesDocument } from 'src/notes/notes.schema';
import { StudentService} from 'src/users/student/student.service';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from '../auth/guards/authorization.guard';
import { Role, Roles } from '../auth/decorators/role.decorator';

@Injectable()
@UseGuards(AuthGuard) // Apply AuthGuard globally to all methods in modules

export class ModulesService {
  constructor(
   // @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Module.name) private readonly moduleModel: Model<moduleDocument>,
    @InjectModel(Content.name) private readonly contentModel: Model<contentDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    @InjectModel(Users.name) private readonly usersModel: Model<userDocument>,
    @InjectModel(Notes.name) private readonly notesModel: Model<notesDocument>,
    @Inject(forwardRef(() => QuizzesService)) private readonly quizzesService: QuizzesService,
    @Inject(forwardRef(() => QuestionsService)) private readonly questionsService: QuestionsService,
    @Inject(forwardRef(() => NotesService)) private readonly notesService: NotesService, // Inject ModulesService with forwardRef
    @Inject(forwardRef(() => ContentService)) private readonly contentService: ContentService, 
    @Inject(forwardRef(() => CoursesService)) private readonly coursesService: CoursesService, 
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService, 
    @Inject(forwardRef(() => StudentService)) private readonly studentService: StudentService, 
  ) {}

  //find all modules is for admin only? since student only sees for enrolled
  //courses and intructor sees for the courses they teach
  
@UseGuards(AuthorizationGuard)
@Roles(Role.Admin, Role.Instructor)
    async findAll(): Promise<moduleDocument[]> {
        return this.moduleModel.find().exec();
      }

//get module by id for courses
      async findById(moduleId: mongoose.Types.ObjectId): Promise<moduleDocument> {
        const module = await this.moduleModel.findById(moduleId).exec();
        if (!module) {
          throw new NotFoundException(`Module with Object id ${moduleId} not found`);
        }
        return module;
      }
 //get module by title 
      async findByTitle(title: string): Promise<moduleDocument> {
        const module = await this.moduleModel.findOne({title}).exec();
        if (!module) {
          throw new NotFoundException(`Module with title ${title} not found`);
        }
        return module;
      }


      
//implemented by farah for use in quiz
async findModuleByQuizId(quizId: mongoose.Types.ObjectId): Promise<moduleDocument>{
  const module = await this.moduleModel.findOne({quizzes: {$in: [quizId]}})
  return module;
}

// Create a new Module
async create(createModuleDto: CreateModuleDto): Promise<moduleDocument> {
  const newModule = new this.moduleModel(createModuleDto);
  newModule.created_at= new Date(); 
  return await newModule.save();
}
// Update an existing module by title
async update(title: string, updateModuleDto: UpdateModuleDto): Promise<moduleDocument> {
  const updatedModule = await this.moduleModel.findOneAndUpdate({title, updateModuleDto}, { new: true });
  if (!updatedModule) {
    throw new NotFoundException(`Module with title${title} not found`);
  }
  return updatedModule;
}

// Delete a module by title
async delete(title: string): Promise<moduleDocument> {
  const deletedModule = await this.moduleModel.findOneAndDelete({title}).exec();
  if (!deletedModule) {
    throw new NotFoundException(`Module with title ${title} not found`);
  }
  return deletedModule;
}

//GET/modules/:title: retrieve all quizzes for specific module 
//async getQuizForModule(title: string): Promise<Quiz[]> {
 // const module = await this.findByTitle(title); // Fetch the module by its title

  //const quizzes = await Promise.all(
    //module.quizzes.map((moduleId) =>
      //this.quizzesService.findOne(moduleId), // Fetch each quiz by its
    //),
  //);

  //return quizzes;
//}

//GET/modules/:title: retrieve all quizzes for specific module 
// async getQuestionForModule(title: string): Promise<Question[]> {
//   const module = await this.findByTitle(title); // Fetch the module by its title

//   const questions = await Promise.all(
//     module.questions.map((moduleId) =>
//       this.questionsService.findOne(moduleId), // Fetch each quiz by its
//     ),
//   );

//   return questions;
// }

//GET/modules/:title: retrieve all question for specific module 
// async getQuestionForModule(title: string): Promise<Question[]> {
//   const module = await this.findByTitle(title); // Fetch the module by its title

//   const questions = await Promise.all(
//     module.questions.map((moduleId) =>
//       this.questionsService.findOne(moduleId), // Fetch each quiz by its
//     ),
//   );

//   return questions;
// }



//GET/modules/:title: retrieve all quizzes for specific module 
// async getNotesForModule(title: string): Promise<Note[]> {
//   const module = await this.findByTitle(title); // Fetch the module by its title

//   const notes = await Promise.all(
//     module.notes.map((moduleId) =>
//       this.notesService.findOne(moduleId), // Fetch each quiz by its
//     ),
//   );

//   return notes;
// }

//GET: find course outdated attribute by course code
async findOutdated(title: string): Promise<boolean> {
  const module = await this.moduleModel.findOne({ title }, { isOutdated: 1, _id: 0 }) 
  if (!module) {
    throw new NotFoundException(`Course with module ${title} not found`);
  }

  return module.isOutdated;
}

//PUT: change outdated of course
async toggleOutdated(title: string): Promise<moduleDocument> {
  const module = await this.moduleModel.findOne({ title }).exec();
  if (!module) {
    throw new NotFoundException(`Course with module ${title} not found`);
  }
  module.isOutdated = !module.isOutdated;
  return await module.save();
}




// Method to add file metadata to a Module's resources
async addFileToModule(moduleId: string, fileUrl: string, originalName: string, fileType: string,contentTitle:string): Promise<moduleDocument> {
  const module = await this.moduleModel.findById(moduleId).exec();
  if (!module) {
    throw new Error(`Module with ID ${moduleId} not found`);
  }

  // Create metadata for the uploaded file
  const fileMetadata = {
    filePath: fileUrl,
    fileType: fileType,
    originalName: originalName,
  };
// Create contentDto to match the CreateContentDto structure
// Create contentDto to match the CreateContentDto structure
const contentDto = {
  title: contentTitle, // The title field should match 'title' in CreateContentDto
  resources: [fileMetadata], // resources should be an array of file metadata objects
};

// Create content and pass it to the content service
const contents = await this.contentService.createContent(contentDto);
 module.content.push(contents._id);
 
  // Save the updated module
  await module.save();

  return module;
}









// delete module and all related quizzes and questions 
async deleteModule(moduleId: mongoose.Types.ObjectId): Promise<any> {
  // Step 1: Find the module to delete
  const module = await this.moduleModel.findById(moduleId).exec();
  if (!module) {
    throw new NotFoundException(`Module with ID ${moduleId} not found`);
  }

  // Step 2: Extract related quizzes and questions
  const { quizzes = [], questions = [] } = module;

  // Step 3: Delete related Quizzes using Quizzes API
  try {
    if (quizzes.length > 0) {
      await Promise.all(
        quizzes.map(async (quizId) => {
          await this.quizzesService.deleteQuiz(new mongoose.Types.ObjectId(quizId));
        })
      );
    }
  } catch (error) {
    console.error("Error deleting quizzes for module:", error);
    throw new InternalServerErrorException("Failed to delete related quizzes for module.");
  }

  // Step 4: Delete related Questions using Questions API
  try {
    if (questions.length > 0) {
      await Promise.all(
        questions.map(async (questionId) => {
          await this.questionsService.delete(new mongoose.Types.ObjectId(questionId));
        })
      );
    }
  } catch (error) {
    console.error("Error deleting questions for module:", error);
    throw new InternalServerErrorException("Failed to delete related questions for module.");
  }

  // Step 5: Delete the module itself
  await this.moduleModel.findByIdAndDelete(moduleId).exec();

  return { message: "Module and its related data deleted successfully" };
}


//get all quizzes of module by module objectid
async getQuizzesForModule(ObjectId: mongoose.Types.ObjectId): Promise<QuizzesDocument[]> {
  const module = await this.findById(ObjectId);

  if (!module) {
    throw new NotFoundException(`module with code ${ObjectId} not found`);
  }

  // Fetch all modules by their ObjectIds
  const quizzes = await this.quizModel.find({
    _id: { $in: module.quizzes }, // Match ObjectIds in `course.modules`
  }).exec();

  return quizzes;
}

//get all questions of module by module objectid
async getQuestionsForModule(ObjectId: mongoose.Types.ObjectId): Promise<QuestionsDocument[]> {
  const module = await this.findById(ObjectId);

  if (!module) {
    throw new NotFoundException(`module with code ${ObjectId} not found`);
  }

  // Fetch all modules by their ObjectIds
  const questions = await this.questionModel.find({
    _id: { $in: module.questions }, // Match ObjectIds in `course.modules`
  }).exec();

  return questions;
}


// Add quiz to modules array
async addQuizToModule(moduleId: mongoose.Types.ObjectId, quizId: mongoose.Types.ObjectId): Promise<moduleDocument> {
  // Find the module by ID
  const module = await this.moduleModel.findById(moduleId).exec();
  if (!module) {
    throw new NotFoundException(`Module with ID ${moduleId} not found.`);
  }

  // Check if the quiz is already in the array
  if (module.quizzes.some((existingQuizId) => existingQuizId.equals(quizId))) {
    throw new Error('Quiz is already added to this module.');
  }

  // Add the quiz ID to the array
  module.quizzes.push(quizId);

  // Save the updated module
  await module.save();

  return module;
}



// Add question to modules array
async addQuestionToModule(moduleId: mongoose.Types.ObjectId, questionId: mongoose.Types.ObjectId): Promise<moduleDocument> {
  // Find the module by ID
  const module = await this.moduleModel.findById(moduleId).exec();
  if (!module) {
    throw new NotFoundException(`Module with ID ${moduleId} not found.`);
  }

  // Check if the quiz is already in the array
  if (module.quizzes.some((existingQuizId) => existingQuizId.equals(questionId))) {
    throw new Error('Quiz is already added to this module.');
  }

  // Add the quiz ID to the array
  module.quizzes.push(questionId);

  // Save the updated module
  await module.save();

  return module;
}

//GET AVERAGE RATING
async getTotalRating( ObjectId: mongoose.Types.ObjectId): Promise<number> {
  const course = await this.moduleModel.findById(ObjectId);
  return course.totalRating;
 }
 
 //SET RATING,TOTAL,AVERAGE
 async setRating(ObjectId: mongoose.Types.ObjectId,score:number): Promise<void> {
   const module = await this.moduleModel.findById(ObjectId);
   module.totalRating = module.totalRating + score;
   module.totalStudents += 1;
   module.averageRating = module.totalRating/module.totalStudents;
 }

 //GET NOTES FOR A SPECIFIC USER
 async getNotesForUserAndNote(username: string, title: string): Promise<notesDocument[]> {
  const module = await this.findByTitle(title) as moduleDocument;
  if (!module || !module._id) {
    throw new NotFoundException(`Module with title "${title}" not found`);
  }

  const notesId = await this.studentService.getAllNotesForModule(module._id, username);
  if (!notesId || notesId.length === 0) {
    return []; 
  }

  const notes: notesDocument[] = [];
  for (const noteId of notesId) {
    const note = await this.notesService.findByIdNote(noteId);
    notes.push(note); // Add the note to the array
  }

  return notes;
}
 //GET NOTES FOR A SPECIFIC USER
 async getNotesForUserAndNote(username: string, title: string): Promise<notesDocument[]> {
  const module = await this.findByTitle(title) as moduleDocument;
  if (!module || !module._id) {
    throw new NotFoundException(`Module with title "${title}" not found`);
  }

  const notesId = await this.studentService.getAllNotesForModule(module._id, username);
  if (!notesId || notesId.length === 0) {
    return []; 
  }

  const notes: notesDocument[] = [];
  for (const noteId of notesId) {
    const note = await this.notesService.findByIdNote(noteId);
    notes.push(note); // Add the note to the array
  }

  return notes;
}

//GET A SPECIFIC NOTE FOR A SPEICIFC MODULE
async getNoteForUser(notetId: mongoose.Types.ObjectId): Promise<notesDocument>{
 return await this.notesService.findByIdNote(notetId);
}

//Delete NOTE FOR A SPECIFIC NOTE
async deleteNote(title:string,username:string,notetId: mongoose.Types.ObjectId): Promise<void>{
  const module = await this.findByTitle(title) as moduleDocument;
  if (!module || !module._id) {
    throw new NotFoundException(`Module with title "${title}" not found`);
  }
  const note= await this.notesService.findByIdNote(notetId);
  const student = await this.usersService.findUserByUsername(username);

  if (student.notes.has(module._id)) {
    const noteIds = student.notes.get(module._id);  // Get the array of note IDs for the specified module ID
    if (noteIds) {
      const updatedNoteIds = noteIds.filter(id => !id.equals(note._id)); // Using filter to create a new array without the note ID
      student.notes.set(module._id, updatedNoteIds);  // Set the updated array back to the Map
    }
  }
  await student.save(); 

  await this.notesService.deleteNote(notetId);

}


 //CREATE NOTE FOR A SPECIFIC NOTE
 async createNote(title:string,username:string,content: string): Promise<notesDocument>{
  const course = await this.coursesService.getCourseForModule(title);
  const module= await this.findByTitle(title) as moduleDocument;

  const notesDto = {
    username: username, 
    course_code: course.course_code,
    content: content,
  };
  const note = await this.notesService.createNote(notesDto) as notesDocument;
  const user = await this.usersService.findUserByUsername(username);
  user.notes.get(module._id)?.push(note._id);
  await user.save();
  return note;
 }

 //UPDATE NOTE FOR A SPECIFIC NOTE
async UpdateNote(notetId: mongoose.Types.ObjectId,contentNew:string): Promise<notesDocument>{
  const notesDto = {
    content:contentNew,
  };
 const note= await this.notesService.updateNote(notetId, notesDto);
  return note;
}


}

//add guards to courses and modules, update users, ask amany, start notifcations
