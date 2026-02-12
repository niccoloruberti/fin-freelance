import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @ManyToOne('User', (user: any) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column()
  userId: string;

  @ManyToOne('Category', { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: any;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne('Client', { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: any;

  @Column({ nullable: true })
  clientId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
