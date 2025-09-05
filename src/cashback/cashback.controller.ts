import { Controller, Get, Post, Body, Param, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CashbackService } from './cashback.service';
import { ProcessCashbackDto, SearchProductsDto } from './dto/cashback.dto';
import { AdminGuard } from '../guards/admin.guard';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('cashback')
@UsePipes(new ValidationPipe())
export class CashbackController {
  constructor(
    private cashbackService: CashbackService,
    private supabaseService: SupabaseService
  ) {}

  @Get('products')
  @UseGuards(AdminGuard)
  async getProducts() {
    return await this.cashbackService.getProducts();
  }

  @Get('products/search')
  @UseGuards(AdminGuard)
  async searchProducts(@Query() query: SearchProductsDto) {
    return await this.cashbackService.searchProducts(query.query);
  }

  @Post('process')
  @UseGuards(AdminGuard)
  async processCashback(@Body() body: ProcessCashbackDto) {
    return await this.cashbackService.processCashback(body.productId, body.phoneNumber);
  }

  @Get('health')
  async checkSupabaseHealth() {
    const isConnected = await this.supabaseService.testConnection();
    return {
      statusCode: 200,
      message: isConnected ? 'Supabase connection is healthy' : 'Supabase connection failed',
      supabaseConnected: isConnected,
      timestamp: new Date().toISOString()
    };
  }
}
