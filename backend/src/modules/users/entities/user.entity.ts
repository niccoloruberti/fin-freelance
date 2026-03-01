import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  vatNumber: string; // Partita IVA

  @Column({ nullable: true })
  fiscalCode: string; // Codice Fiscale

  @Column({ type: 'enum', enum: ['forfettario', 'ordinario'], default: 'forfettario' })
  taxRegime: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 78 })
  taxCoefficientIncome: number; // Coefficiente di redditività (es. 78%)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15 })
  taxRateSubstitutive: number; // Aliquota sostitutiva (es. 15%)

  @Column({
    type: 'enum',
    enum: ['gestione_separata', 'cassa_professionale', 'artigiani_commercianti'],
    default: 'gestione_separata',
  })
  inpsManagement: string; // Gestione previdenziale

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('Transaction', (transaction: any) => transaction.user)
  transactions: any[];

  @OneToMany('Client', (client: any) => client.user)
  clients: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
