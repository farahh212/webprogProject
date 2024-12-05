import { Body, Controller, Get, Post, Param, Delete, Put,NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Notes } from './notes.schema'; 
import * as mongoose from 'mongoose'; // Import mongoose to use ObjectId
import { notesDocument } from './notes.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getAllNotes(): Promise<Notes[]> {
    return await this.notesService.findAll();
  }

  //GET: notes by objectId
  @Get('id/:noteId')
  async findByIdNote(@Param('noteId') noteId: mongoose.Types.ObjectId): Promise<notesDocument> {
    return this.notesService.findByIdNote(noteId);
  }

  //GET NOTES by usernmae,coursecode,last updated
  // @Get()
  // async findNote(@Param('username') username: string, @Param('course_code')course_code:string, @Param('lastUpdated')lastUpdated:Date): Promise<notesDocument> {
  //   return this.notesService.findNote(username,course_code,lastUpdated);
  // }

  // CREATE NOTE
  @Post()
  async createNote(@Body() createNoteDto: CreateNoteDto): Promise<Notes> {
    return await this.notesService.createNote(createNoteDto);
  }

  //DELETE NOTE
  @Delete()
  async deleteNote(@Param('noteId') noteId: mongoose.Types.ObjectId){
     await this.notesService.deleteNote(noteId);
  }

  //DELETE NOTE by username
  @Delete()
  async deleteNoteByUsername(@Param('username') username:string){
    await this.notesService.deleteNoteByUsername(username);
  }

//UPDATE NOTE
  @Put()
  async updateNote(@Param('noteId') noteId: mongoose.Types.ObjectId,@Body() updateNoteDto: UpdateNoteDto,): Promise<notesDocument> {
    return await this.notesService.updateNote(noteId, updateNoteDto);
  }
}