import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['income', 'expense', 'both'], default: 'both' })
  @IsEnum(['income', 'expense', 'both'])
  type: 'income' | 'expense' | 'both';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Se le transazioni in questa categoria concorrono al reddito imponibile' })
  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean;
}
