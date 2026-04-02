import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['income', 'expense', 'both'], default: 'both' })
  type: 'income' | 'expense' | 'both';

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: true })
  isDefault: boolean; // Categorie di sistema vs utente

  @Column({ default: true })
  isTaxable: boolean; // Se le transazioni in questa categoria concorrono al reddito imponibile

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
