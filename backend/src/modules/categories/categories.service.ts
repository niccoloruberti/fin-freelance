import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';

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
}
