import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [TaxController],
  providers: [TaxService],
})
export class TaxModule {}
