import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecurringTransactionDto {
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiProperty({ example: 800.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Affitto studio' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' })
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @ApiPropertyOptional({ example: 1, description: 'Giorno del periodo (1-28 per mensile)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  dayOfPeriod?: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Se le transazioni generate concorrono al reddito imponibile' })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;
}
