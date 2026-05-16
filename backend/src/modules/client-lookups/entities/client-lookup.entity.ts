import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum LookupType {
  SOURCE = 'source',
  SERVICE = 'service',
}

@Entity('client_lookups')
export class ClientLookup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: LookupType })
  type: LookupType;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
