import { Controller, Get, Post, Body, Param, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CashbackService } from './cashback.service';
import { ProcessCashbackDto, SearchProductsDto, GetProductsDto } from './dto/cashback.dto';
import { AdminGuard } from '../guards/admin.guard';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('cashback')
@UsePipes(new ValidationPipe())
export class CashbackController {
  constructor(
    private cashbackService: CashbackService,
    private supabaseService: SupabaseService
  ) {}

  @Post('products')
  // @UseGuards(AdminGuard) // Временно отключено для тестирования
  async getProducts(@Body() body: GetProductsDto) {
    return await this.cashbackService.getProducts();
  }

  @Post('products/search')
  // @UseGuards(AdminGuard) // Временно отключено для тестирования
  async searchProducts(@Body() body: SearchProductsDto) {
    return await this.cashbackService.searchProducts(body.query);
  }

  @Post('process')
  // @UseGuards(AdminGuard) // Временно отключено для тестирования
  async processCashback(@Body() body: ProcessCashbackDto) {
    return await this.cashbackService.processCashback(body.productId, body.phoneNumber);
  }

  @Get('health')
  async checkSupabaseHealth() {
    const isConnected = await this.supabaseService.testConnection();
    const currentMode = this.supabaseService.getCurrentMode();
    return {
      statusCode: 200,
      message: isConnected ? `${currentMode} connection is healthy` : `${currentMode} connection failed`,
      connected: isConnected,
      currentMode: currentMode,
      timestamp: new Date().toISOString()
    };
  }
}
