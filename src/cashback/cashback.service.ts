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
  ) { }

  async processCashback(
    productId: string,
    phoneNumber: string,
    customPrice?: number
  ) {
    try {
      this.logger.log(`Processing cashback for productId: ${productId}, phoneNumber: ${phoneNumber}${customPrice !== undefined ? `, customPrice: ${customPrice}` : ''}`);

      // Получаем товар из MockAPI/Supabase
      this.logger.log('Fetching product from external service...');
      const product = await this.supabaseService.getProductById(productId);

      // Используем кастомную цену если передана, иначе цену из базы
      const priceToUse = customPrice !== undefined ? customPrice : product.price;
      this.logger.log(`Product found: ${product.name}, original price: ${product.price}${customPrice !== undefined ? `, using custom price: ${customPrice}` : ', using original price'}`);

      // Находим пользователя
      this.logger.log('Finding user by phone number...');
      const user = await this.userService.findByPhoneNumber(phoneNumber);
      if (!user) {
        this.logger.warn(`User not found: ${phoneNumber}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`User found: ${user.name}, current balance: ${user.balance}`);

      // Рассчитываем кешбек (3% от цены товара) и округляем до 1 знака после запятой
      const cashbackAmount = Math.round((priceToUse * this.CASHBACK_PERCENTAGE) * 10) / 10;
      this.logger.log(`Calculated cashback: ${cashbackAmount} (3% of ${priceToUse}, rounded to 1 decimal)`);

      // Начисляем кешбек пользователю
      this.logger.log('Adding cashback to user...');
      const result = await this.userService.addCashback(phoneNumber, cashbackAmount, {
        productId: product.id,
        productName: product.name,
        productPrice: priceToUse // Используем цену которая была использована для расчета
      });

      this.logger.log(`Cashback added successfully. New balance: ${result.user.balance}`);

      return {
        statusCode: 200,
        message: 'Cashback processed successfully',
        data: {
          product: {
            id: product.id,
            name: product.name,
            price: priceToUse
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

  async deductCashback(phoneNumber: string, amount: number, reason?: string) {
    try {
      this.logger.log(`Processing cashback deduction for phoneNumber: ${phoneNumber}, amount: ${amount}`);

      // Валидируем сумму списания
      if (amount <= 0) {
        throw new HttpException('Deduction amount must be positive', HttpStatus.BAD_REQUEST);
      }

      // Округляем сумму до 1 знака после запятой
      const roundedAmount = Math.round(amount * 10) / 10;
      this.logger.log(`Rounded deduction amount: ${roundedAmount}`);

      // Находим пользователя
      this.logger.log('Finding user by phone number...');
      const user = await this.userService.findByPhoneNumber(phoneNumber);
      if (!user) {
        this.logger.warn(`User not found: ${phoneNumber}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`User found: ${user.name}, current balance: ${user.balance}`);

      // Проверяем достаточность баланса
      if (user.balance < roundedAmount) {
        this.logger.warn(`Insufficient balance: ${user.balance} < ${roundedAmount}`);
        throw new HttpException(`Insufficient balance. Current balance: ${user.balance}, requested deduction: ${roundedAmount}`, HttpStatus.BAD_REQUEST);
      }

      // Списываем кэшбек у пользователя
      this.logger.log('Deducting cashback from user...');
      const deductionReason = reason || 'Cashback deduction';
      const result = await this.userService.deductCashback(phoneNumber, roundedAmount, deductionReason);
      this.logger.log(`Cashback deducted successfully. New balance: ${result.user.balance}`);

      return {
        statusCode: 200,
        message: 'Cashback deducted successfully',
        data: {
          deduction: {
            amount: roundedAmount,
            reason: deductionReason
          },
          user: result.user,
          transaction: result.transaction
        }
      };
    } catch (error) {
      this.logger.error(`Failed to deduct cashback: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to deduct cashback: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
