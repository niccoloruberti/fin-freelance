import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['income', 'expense'], example: 'income' })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiProperty({ example: 1500.0, description: 'Importo della transazione' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Consulenza per Progetto X' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2024-03-15', description: 'Data (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'FT-2024-001' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-client' })
  @IsOptional()
  @IsUUID()
  clientId?: string;
}
