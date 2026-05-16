import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClientLookupsService } from './client-lookups.service';
import { CreateClientLookupDto } from './dto/create-client-lookup.dto';
import { LookupType } from './entities/client-lookup.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('client-lookups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('client-lookups')
export class ClientLookupsController {
  constructor(private readonly service: ClientLookupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get lookup options for the authenticated user' })
  @ApiQuery({ name: 'type', enum: LookupType })
  findAll(@Query('type') type: LookupType, @Request() req) {
    return this.service.findByUserAndType(req.user.userId, type);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new lookup option' })
  create(@Body() dto: CreateClientLookupDto, @Request() req) {
    return this.service.create(req.user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lookup option' })
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.userId);
  }
}
