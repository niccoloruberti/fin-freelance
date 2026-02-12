import { IsEmail, IsString, IsOptional, IsEnum, IsDecimal, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Mario' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Rossi' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiPropertyOptional({ example: 'RSSMRA80A01H501U' })
  @IsOptional()
  @IsString()
  fiscalCode?: string;

  @ApiPropertyOptional({ example: 'forfettario', enum: ['forfettario', 'ordinario'] })
  @IsOptional()
  @IsEnum(['forfettario', 'ordinario'])
  taxRegime?: string;

  @ApiPropertyOptional({ example: 78 })
  @IsOptional()
  @IsDecimal()
  taxCoefficientIncome?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsDecimal()
  taxRateSubstitutive?: number;
}
