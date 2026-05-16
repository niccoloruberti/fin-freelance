import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ClientStatus {
  LEAD = 'lead',
  ACTIVE = 'active',
  WAITING = 'attesa',
  BOOKING = 'prenotazione',
  FINALIZED = 'finalizzato',
  LOST = 'perso',
  ARCHIVED = 'archived',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ nullable: true })
  fiscalCode: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  service: string;

  @Column({ type: 'date', nullable: true })
  contactDate: Date;

  @Column({ type: 'date', nullable: true })
  lastContactDate: Date;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ACTIVE })
  status: ClientStatus;

  @ManyToOne('User', (user: any) => user.clients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
