import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringTransaction } from './entities/recurring-transaction.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, startOfDay, format, parseISO } from 'date-fns';

@Injectable()
export class RecurringService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringRepo: Repository<RecurringTransaction>,
    @InjectRepository(Transaction)
    private transactionsRepo: Repository<Transaction>,
  ) {}

  async create(userId: string, dto: CreateRecurringTransactionDto): Promise<RecurringTransaction> {
    const item = this.recurringRepo.create({ ...dto, userId });
    const saved = await this.recurringRepo.save(item);
    await this.generateTransactionsFor(saved);
    return this.findOne(saved.id, userId);
  }

  async findByUser(userId: string): Promise<RecurringTransaction[]> {
    return this.recurringRepo.find({
      where: { userId },
      relations: ['category', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<RecurringTransaction> {
    const item = await this.recurringRepo.findOne({
      where: { id, userId },
      relations: ['category', 'client'],
    });
    if (!item) throw new NotFoundException(`RecurringTransaction ${id} not found`);
    return item;
  }

  async update(id: string, userId: string, dto: UpdateRecurringTransactionDto): Promise<RecurringTransaction> {
    const item = await this.findOne(id, userId);
    Object.assign(item, dto);
    await this.recurringRepo.save(item);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.findOne(id, userId);
    await this.recurringRepo.remove(item);
  }

  // Runs every day at 01:00
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generatePendingTransactions(): Promise<void> {
    const actives = await this.recurringRepo.find({ where: { active: true } });
    for (const recurring of actives) {
      await this.generateTransactionsFor(recurring);
    }
  }

  private async generateTransactionsFor(recurring: RecurringTransaction): Promise<void> {
    const today = startOfDay(new Date());
    const start = startOfDay(parseISO(recurring.startDate as any));
    const end = recurring.endDate ? startOfDay(parseISO(recurring.endDate as any)) : null;
    const lastGenerated = recurring.lastGeneratedDate
      ? startOfDay(parseISO(recurring.lastGeneratedDate as any))
      : null;

    // First date to generate: start date, or next occurrence after lastGenerated
    let current = lastGenerated ? this.nextOccurrence(lastGenerated, recurring.frequency) : start;

    // Generate all dates up to today (inclusive)
    while (!isAfter(current, today)) {
      if (isBefore(current, start)) {
        current = this.nextOccurrence(current, recurring.frequency);
        continue;
      }
      if (end && isAfter(current, end)) break;

      await this.transactionsRepo.save(
        this.transactionsRepo.create({
          userId: recurring.userId,
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          date: format(current, 'yyyy-MM-dd') as any,
          isRecurring: true,
          recurringTransactionId: recurring.id,
          categoryId: recurring.categoryId,
          clientId: recurring.clientId,
        }),
      );

      recurring.lastGeneratedDate = format(current, 'yyyy-MM-dd') as any;
      await this.recurringRepo.save(recurring);

      current = this.nextOccurrence(current, recurring.frequency);
    }
  }

  private nextOccurrence(from: Date, frequency: string): Date {
    switch (frequency) {
      case 'daily':   return addDays(from, 1);
      case 'weekly':  return addWeeks(from, 1);
      case 'yearly':  return addYears(from, 1);
      default:        return addMonths(from, 1);
    }
  }
}
