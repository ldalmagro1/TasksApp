import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Category "${dto.name}" already exists`);
    const cat = this.categoryRepo.create({ name: dto.name });
    return this.categoryRepo.save(cat);
  }

  async remove(id: string): Promise<void> {
    const cat = await this.findOne(id);
    await this.categoryRepo.remove(cat);
  }
}
