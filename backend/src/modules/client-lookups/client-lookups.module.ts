import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientLookup } from './entities/client-lookup.entity';
import { ClientLookupsService } from './client-lookups.service';
import { ClientLookupsController } from './client-lookups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClientLookup])],
  controllers: [ClientLookupsController],
  providers: [ClientLookupsService],
})
export class ClientLookupsModule {}
