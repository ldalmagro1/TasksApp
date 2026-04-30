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
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: 'title' | 'date',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @CurrentUser() user?: any,
  ) {
    return this.notesService.findAll({ categoryId, startDate, endDate, sortBy, sortOrder }, user.userId);
  }

  @Get('archived')
  findArchived(
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: 'title' | 'date',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @CurrentUser() user?: any,
  ) {
    return this.notesService.findArchived({ categoryId, startDate, endDate, sortBy, sortOrder }, user.userId);
  }

  @Get('trash')
  findTrash(@CurrentUser() user?: any) {
    return this.notesService.findTrash(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.notesService.findOne(id, user.userId);
  }

  @Post()
  create(@Body() dto: CreateNoteDto, @CurrentUser() user?: any) {
    return this.notesService.create(dto, user.userId);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoteDto, @CurrentUser() user?: any) {
    return this.notesService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.notesService.remove(id, user.userId);
  }

  @Patch(':id/restore')
  restoreTrash(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.notesService.restore(id, user.userId);
  }

  @Patch(':id/archive')
  archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.notesService.archive(id, user.userId);
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.notesService.unarchive(id, user.userId);
  }
}
