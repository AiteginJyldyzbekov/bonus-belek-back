import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CashbackService {
  private readonly CASHBACK_PERCENTAGE = 0.03; // 3%

  constructor(
    private userService: UserService,
    private supabaseService: SupabaseService
  ) {}

  async processCashback(productId: string, phoneNumber: string) {
    try {
      // Получаем товар из Supabase
      const product = await this.supabaseService.getProductById(productId);
      
      // Находим пользователя
      const user = await this.userService.phoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Рассчитываем кешбек (3% от цены товара)
      const cashbackAmount = product.price * this.CASHBACK_PERCENTAGE;

      // Начисляем кешбек пользователю
      const result = await this.userService.addCashback(phoneNumber, cashbackAmount, {
        productId: product.id,
        productName: product.name,
        productPrice: product.price
      });

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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to process cashback', HttpStatus.INTERNAL_SERVER_ERROR);
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
