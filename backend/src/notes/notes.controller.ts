import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.notesService.findAll(categoryId);
  }

  @Get('archived')
  findArchived(@Query('categoryId') categoryId?: string) {
    return this.notesService.findArchived(categoryId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateNoteDto) {
    return this.notesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.remove(id);
  }

  @Patch(':id/archive')
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.archive(id);
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.unarchive(id);
  }
}
