import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CashbackService {
  private readonly CASHBACK_PERCENTAGE = 0.03; // 3%
  private readonly logger = new Logger(CashbackService.name);

  constructor(
    private userService: UserService,
    private supabaseService: SupabaseService
  ) {}

  async processCashback(productId: string, phoneNumber: string) {
    try {
      this.logger.log(`Processing cashback for productId: ${productId}, phoneNumber: ${phoneNumber}`);
      
      // Получаем товар из MockAPI/Supabase
      this.logger.log('Fetching product from external service...');
      const product = await this.supabaseService.getProductById(productId);
      this.logger.log(`Product found: ${product.name}, price: ${product.price}`);
      
      // Находим пользователя
      this.logger.log('Finding user by phone number...');
      const user = await this.userService.findByPhoneNumber(phoneNumber);
      if (!user) {
        this.logger.warn(`User not found: ${phoneNumber}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`User found: ${user.name}, current balance: ${user.balance}`);

      // Рассчитываем кешбек (3% от цены товара) и округляем до 1 знака после запятой
      const cashbackAmount = Math.round((product.price * this.CASHBACK_PERCENTAGE) * 10) / 10;
      this.logger.log(`Calculated cashback: ${cashbackAmount} (3% of ${product.price}, rounded to 1 decimal)`);

      // Начисляем кешбек пользователю
      this.logger.log('Adding cashback to user...');
      const result = await this.userService.addCashback(phoneNumber, cashbackAmount, {
        productId: product.id,
        productName: product.name,
        productPrice: product.price // Преобразуем число в строку
      });
      this.logger.log(`Cashback added successfully. New balance: ${result.user.balance}`);

      return {
        statusCode: 200,
        message: 'Cashback processed successfully',
        data: {
          product: {
            id: product.id,
            name: product.name,
            price: product.price
          },
          cashback: {
            amount: cashbackAmount,
            percentage: this.CASHBACK_PERCENTAGE * 100
          },
          user: result.user,
          transaction: result.transaction
        }
      };
    } catch (error) {
      this.logger.error(`Failed to process cashback: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to process cashback: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProducts() {
    try {
      const products = await this.supabaseService.getAllProducts();
      return {
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: products
      };
    } catch (error) {
      throw new HttpException('Failed to fetch products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchProducts(query: string) {
    try {
      const products = await this.supabaseService.searchProducts(query);
      return {
        statusCode: 200,
        message: 'Products search completed',
        data: products
      };
    } catch (error) {
      throw new HttpException('Failed to search products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
