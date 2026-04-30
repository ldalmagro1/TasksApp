import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.categoriesService.findAll(user.userId);
  }

  @Get('trash')
  findTrash(@CurrentUser() user: any) {
    return this.categoriesService.findTrash(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.categoriesService.findOne(id, user.userId);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: any) {
    return this.categoriesService.create(dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.categoriesService.remove(id, user.userId);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.categoriesService.restore(id, user.userId);
  }
}
