import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(categoryId?: string): Promise<Note[]> {
    const qb = this.noteRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .where('note.archived = :archived', { archived: false })
      .orderBy('note.updatedAt', 'DESC');

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    return qb.getMany();
  }

  async findArchived(categoryId?: string): Promise<Note[]> {
    const qb = this.noteRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .where('note.archived = :archived', { archived: true })
      .orderBy('note.updatedAt', 'DESC');

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.noteRepo.findOne({ where: { id } });
    if (!note) throw new NotFoundException(`Note #${id} not found`);
    return note;
  }

  async create(dto: CreateNoteDto): Promise<Note> {
    const categories = await this.resolveCategories(dto.categoryIds);
    const note = this.noteRepo.create({
      title: dto.title,
      content: dto.content ?? '',
      categories,
    });
    return this.noteRepo.save(note);
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;
    if (dto.categoryIds !== undefined) {
      note.categories = await this.resolveCategories(dto.categoryIds);
    }

    return this.noteRepo.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.noteRepo.remove(note);
  }

  async archive(id: string): Promise<Note> {
    const note = await this.findOne(id);
    note.archived = true;
    return this.noteRepo.save(note);
  }

  async unarchive(id: string): Promise<Note> {
    const note = await this.findOne(id);
    note.archived = false;
    return this.noteRepo.save(note);
  }

  private async resolveCategories(ids?: string[]): Promise<Category[]> {
    if (!ids || ids.length === 0) return [];
    return this.categoryRepo.findBy({ id: In(ids) });
  }
}
