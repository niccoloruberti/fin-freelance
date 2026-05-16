import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientLookup, LookupType } from './entities/client-lookup.entity';
import { CreateClientLookupDto } from './dto/create-client-lookup.dto';

@Injectable()
export class ClientLookupsService {
  constructor(
    @InjectRepository(ClientLookup)
    private repo: Repository<ClientLookup>,
  ) {}

  findByUserAndType(userId: string, type: LookupType): Promise<ClientLookup[]> {
    return this.repo.find({ where: { userId, type }, order: { name: 'ASC' } });
  }

  async create(userId: string, dto: CreateClientLookupDto): Promise<ClientLookup> {
    const entry = this.repo.create({ ...dto, userId });
    return this.repo.save(entry);
  }

  async remove(id: string, userId: string): Promise<void> {
    const entry = await this.repo.findOne({ where: { id, userId } });
    if (!entry) throw new NotFoundException(`Lookup ${id} not found`);
    await this.repo.remove(entry);
  }
}
