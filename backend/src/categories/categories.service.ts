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

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepo.find({ where: { user: { id: userId } }, order: { name: 'ASC' } });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const cat = await this.categoryRepo.findOne({ where: { id, user: { id: userId } } });
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    return cat;
  }

  async create(dto: CreateCategoryDto, userId: string): Promise<Category> {
    const existing = await this.categoryRepo.findOne({ where: { name: dto.name, user: { id: userId } } });
    if (existing) throw new ConflictException(`Category "${dto.name}" already exists`);
    const cat = this.categoryRepo.create({ name: dto.name, user: { id: userId } });
    return this.categoryRepo.save(cat);
  }

  async remove(id: string, userId: string): Promise<void> {
    const cat = await this.findOne(id, userId);
    await this.categoryRepo.softRemove(cat);
  }

  async findTrash(userId: string): Promise<Category[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.categoryRepo.find({
      where: { user: { id: userId } },
      withDeleted: true,
      order: { deletedAt: 'DESC' }
    }).then(cats => cats.filter(c => c.deletedAt && c.deletedAt > thirtyDaysAgo));
  }

  async restore(id: string, userId: string): Promise<Category> {
    const cat = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
      withDeleted: true,
    });
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    if (!cat.deletedAt) throw new ConflictException(`Category #${id} is not in trash`);
    
    return this.categoryRepo.recover(cat);
  }
}
