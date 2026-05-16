import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LookupType } from '../entities/client-lookup.entity';

export class CreateClientLookupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: LookupType })
  @IsEnum(LookupType)
  type: LookupType;
}
