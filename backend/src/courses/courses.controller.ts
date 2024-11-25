
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Courses} from './courses.schema';
import { CreateCourseDto } from './dto/CreateCourse.dto';
import { UpdateCourseDto } from './dto/UpdateCourse.dto';
import { Module } from '../modules/modules.schema';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

@Get()
  async findAll(): Promise<Courses[]> {
    return this.coursesService.findAll();
  
  }

  // GET /Course/:course code: Retrieve a specific product by its ID
  @Get(':course_code')
  async findOne(@Param('course_code') course_code: string): Promise<Courses> {
    return this.coursesService.findOne(course_code);
  }

  // POST /products: Create a new product
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Courses> {
    return this.coursesService.create(createCourseDto);
  }

  // PUT /products/:id: Update an existing product by its ID
  @Put(':course_code')
  async update(@Param('course_code') course_code: string, @Body() updateCourseDto: UpdateCourseDto): Promise<Courses> {
    return this.coursesService.update(course_code, updateCourseDto);
  }

  // DELETE /products/:id: Delete a product by its ID
  @Delete(':course_code')
  async delete(@Param('course_code') course_code: string): Promise<Courses> {
    return this.coursesService.delete(course_code);
  }

  @Get(':course_code/modules')
  async getModulesForCourse(@Param('course_code') course_code: string): Promise<Module[]> {
    return this.coursesService.getModulesForCourse(course_code);
  }

}
