import { LoginDto } from './login.dto';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Mario' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Rossi' })
  @IsString()
  lastName: string;
}
