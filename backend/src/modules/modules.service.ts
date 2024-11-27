import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Module } from './modules.schema';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Quiz } from '../quizzes/quizzes.schema';
import { CreateModuleDto } from './dto/CreateModule.dto';
import { UpdateModuleDto } from './dto/UpdateModule.dto';
import { QuizzesService } from '../quizzes/quizzes.service';
import {Question} from '../questions/questions.schema'
import { QuestionsService } from 'src/questions/questions.service';
import { Note } from 'src/notes/notes.schema';
import { NotesService } from 'src/notes/notes.service';
@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @Inject(forwardRef(() => QuizzesService)) private readonly quizzesService: QuizzesService,
    @Inject(forwardRef(() => QuestionsService)) private readonly questionsService: QuestionsService,
    @Inject(forwardRef(() => NotesService)) private readonly notesService: NotesService, // Inject ModulesService with forwardRef
  ) {}

    async findAll(): Promise<Module[]> {
        return this.moduleModel.find().exec();
      }

//get module by id for courses
      async findById(moduleId: mongoose.Schema.Types.ObjectId): Promise<Module> {
        const module = await this.moduleModel.findById(moduleId).exec();
        if (!module) {
          throw new NotFoundException(`Module with Object id ${moduleId} not found`);
        }
        return module;
      }
 //get module by title 
      async findByTitle(title: string): Promise<Module> {
        const module = await this.moduleModel.findOne({title}).exec();
        if (!module) {
          throw new NotFoundException(`Module with title ${title} not found`);
        }
        return module;
      }

// Create a new Module
async create(createModuleDto: CreateModuleDto): Promise<Module> {
  const newModule = new this.moduleModel(createModuleDto);
  const savedModule = await newModule.save();  // Save the module and get the fully populated document
  return savedModule;
}
// Update an existing module by title
async update(title: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
  const updatedModule = await this.moduleModel.findOneAndDelete({title, updateModuleDto}, { new: true }).exec();
  if (!updatedModule) {
    throw new NotFoundException(`Module with title${title} not found`);
  }
  return updatedModule;
}

// Delete a module by title
async delete(title: string): Promise<Module> {
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
}
