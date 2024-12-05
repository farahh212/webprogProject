import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { ModulesService } from 'src/modules/modules.service';
import { ModulesController } from 'src/modules/modules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesSchema } from './courses.schema';
import { ModulesModule } from '../modules/modules.module'; 
import { ModuleSchema } from '../modules/modules.schema';
import { QuizzesSchema } from '../quizzes/quizzes.schema';
import { QuizzesService } from '../quizzes/quizzes.service';
import { QuestionsService } from 'src/questions/questions.service';
import { NotesService } from 'src/notes/notes.service';
import { QuestionsSchema } from 'src/questions/questions.schema';
import { NoteSchema } from 'src/notes/notes.schema';
import { UsersSchema } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { StudentService } from 'src/users/student/student.service';
import { InstructorService } from 'src/users/instructor/instructor.service';
import { ContentService } from 'src/modules/content/content.service';
import { ContentSchema } from 'src/modules/content/content.schema';
import { ProgressService } from 'src/progress/progress.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Courses', schema: CoursesSchema }]),
    MongooseModule.forFeature([{ name: 'Module', schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: 'Quiz', schema: QuizzesSchema }]),
    MongooseModule.forFeature([{ name: 'Question', schema: QuestionsSchema }]),
    MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }]),
    MongooseModule.forFeature([{ name: 'Users', schema: UsersSchema }]),
    MongooseModule.forFeature([{ name: 'Content', schema: ContentSchema }]),

     // Ensure this is imported here too
  ],

  providers: [CoursesService,ModulesService,QuizzesService,QuestionsService,NotesService,StudentService,InstructorService,UsersService,ContentService,ProgressService],
  controllers: [CoursesController],
  exports:[CoursesService,ModulesService,QuizzesService,QuestionsService,NotesService,StudentService,InstructorService,UsersService,ContentService,ProgressService]
})
export class CoursesModule {}