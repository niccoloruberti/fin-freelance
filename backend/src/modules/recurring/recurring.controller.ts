import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecurringService } from './recurring.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('recurring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un template di transazione ricorrente' })
  create(@Request() req, @Body() dto: CreateRecurringTransactionDto) {
    return this.recurringService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista template ricorrenti dell\'utente' })
  findAll(@Request() req) {
    return this.recurringService.findByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio template ricorrente' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.recurringService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna template ricorrente' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateRecurringTransactionDto) {
    return this.recurringService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina template ricorrente' })
  remove(@Request() req, @Param('id') id: string) {
    return this.recurringService.remove(id, req.user.userId);
  }
}
