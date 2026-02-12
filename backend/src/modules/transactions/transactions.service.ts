import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  // TODO: Implementare CRUD completo
  async findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['category', 'client'],
    });
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      relations: ['category', 'client'],
      order: { date: 'DESC' },
    });
  }
}
