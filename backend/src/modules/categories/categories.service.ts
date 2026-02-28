import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findByType(type: 'income' | 'expense'): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { type: In([type, 'both']) },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({ ...dto, isDefault: false });
    return this.categoriesRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (category.isDefault) {
      throw new ForbiddenException('Le categorie di sistema non possono essere modificate');
    }
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    if (category.isDefault) {
      throw new ForbiddenException('Le categorie di sistema non possono essere eliminate');
    }
    await this.categoriesRepository.remove(category);
  }
}
