import { Controller, Get, Post, Body, Param, Query, UseGuards, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { CashbackService } from './cashback.service';
import { ProcessCashbackDto, SearchProductsDto, GetProductsDto, DeductCashbackDto, ProcessDirectCashbackDto } from './dto/cashback.dto';
import { AdminGuard } from '../guards/admin.guard';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('cashback')
@UsePipes(new ValidationPipe())
export class CashbackController {
  constructor(
    private cashbackService: CashbackService,
    private supabaseService: SupabaseService
  ) { }

  @Get('products')
  // @UseGuards(AdminGuard) // Временно отключено для тестирования
  async getProducts() {
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
    return await this.cashbackService.processCashback(body.productIds, body.phoneNumber,  body.paymentType);
  }

  @Post('process-direct')
  // @UseGuards(AdminGuard) // Временно отключено для тестирования
  async processDirectCashback(@Body() body: ProcessDirectCashbackDto) {
    return await this.cashbackService.processDirectCashback(
      body.products,
      body.phoneNumber,
      body.paymentType
    );
  }

  @Post('deduct')
  // @UseGuards(AdminGuard) // Временно отключено для тестирования
  async deductCashback(@Body() body: DeductCashbackDto) {
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new HttpException('Amount must be a positive number', HttpStatus.BAD_REQUEST);
    }
    return await this.cashbackService.deductCashback(body.phoneNumber, amount, body.reason);
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
