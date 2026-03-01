import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaxService } from './tax.service';

@ApiTags('tax')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get tax summary for a given year' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getSummary(@Request() req, @Query('year') year?: string) {
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.taxService.getSummary(req.user.userId, targetYear);
  }
}
