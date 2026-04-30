import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async findAll(params: { categoryId?: string, startDate?: string, endDate?: string, sortBy?: 'title' | 'date', sortOrder?: 'ASC' | 'DESC' } = {}, userId: string): Promise<Note[]> {
    const qb = this.noteRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .innerJoin('note.user', 'user')
      .where('note.archived = :archived', { archived: false })
      .andWhere('user.id = :userId', { userId });

    if (params.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: params.categoryId });
    }

    if (params.startDate) {
      qb.andWhere('note.date >= :startDate', { startDate: params.startDate });
    }

    if (params.endDate) {
      qb.andWhere('note.date <= :endDate', { endDate: params.endDate });
    }

    if (params.sortBy === 'title') {
      qb.orderBy('note.title', params.sortOrder || 'ASC');
    } else if (params.sortBy === 'date') {
      qb.orderBy('note.date', params.sortOrder || 'DESC', 'NULLS LAST');
    } else {
      qb.orderBy('note.updatedAt', 'DESC');
    }

    return qb.getMany();
  }

  async findArchived(params: { categoryId?: string, startDate?: string, endDate?: string, sortBy?: 'title' | 'date', sortOrder?: 'ASC' | 'DESC' } = {}, userId: string): Promise<Note[]> {
    const qb = this.noteRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .innerJoin('note.user', 'user')
      .where('note.archived = :archived', { archived: true })
      .andWhere('user.id = :userId', { userId });

    if (params.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: params.categoryId });
    }

    if (params.startDate) {
      qb.andWhere('note.date >= :startDate', { startDate: params.startDate });
    }

    if (params.endDate) {
      qb.andWhere('note.date <= :endDate', { endDate: params.endDate });
    }

    if (params.sortBy === 'title') {
      qb.orderBy('note.title', params.sortOrder || 'ASC');
    } else if (params.sortBy === 'date') {
      qb.orderBy('note.date', params.sortOrder || 'DESC', 'NULLS LAST');
    } else {
      qb.orderBy('note.updatedAt', 'DESC');
    }

    return qb.getMany();
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.noteRepo.findOne({ where: { id, user: { id: userId } } });
    if (!note) throw new NotFoundException(`Note #${id} not found`);
    return note;
  }

  async create(dto: CreateNoteDto, userId: string): Promise<Note> {
    const categories = await this.resolveCategories(dto.categoryIds, userId);
    const note = this.noteRepo.create({
      title: dto.title,
      content: dto.content ?? '',
      categories,
      date: dto.date,
      user: { id: userId },
    });
    return this.noteRepo.save(note);
  }

  async update(id: string, dto: UpdateNoteDto, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;
    if (dto.date !== undefined) note.date = dto.date;
    if (dto.categoryIds !== undefined) {
      note.categories = await this.resolveCategories(dto.categoryIds, userId);
    }

    return this.noteRepo.save(note);
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    await this.noteRepo.softRemove(note);
  }

  async findTrash(userId: string): Promise<Note[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.noteRepo.createQueryBuilder('note')
      .withDeleted()
      .leftJoinAndSelect('note.categories', 'category')
      .innerJoin('note.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('note.deletedAt IS NOT NULL')
      .andWhere('note.deletedAt > :thirtyDaysAgo', { thirtyDaysAgo })
      .orderBy('note.deletedAt', 'DESC')
      .getMany();
  }

  async restore(id: string, userId: string): Promise<Note> {
    const note = await this.noteRepo.findOne({
      where: { id, user: { id: userId } },
      withDeleted: true
    });
    
    if (!note) throw new NotFoundException(`Note #${id} not found`);
    if (!note.deletedAt) throw new ConflictException(`Note #${id} is not in trash`);
    
    await this.noteRepo.restore(id);
    return this.findOne(id, userId);
  }

  async archive(id: string, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);
    note.archived = true;
    return this.noteRepo.save(note);
  }

  async unarchive(id: string, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);
    note.archived = false;
    return this.noteRepo.save(note);
  }

  private async resolveCategories(ids: string[] | undefined, userId: string): Promise<Category[]> {
    if (!ids || ids.length === 0) return [];
    return this.categoryRepo.find({ where: { id: In(ids), user: { id: userId } } });
  }
}
