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

  async processCashback(productIds: string[], phoneNumber: string) {
    try {
      this.logger.log(`Processing cashback for ${productIds.length} products, phoneNumber: ${phoneNumber}`);
      this.logger.log(`Product IDs: ${productIds.join(', ')}`);

      // Находим пользователя
      this.logger.log('Finding user by phone number...');
      const user = await this.userService.findByPhoneNumber(phoneNumber);
      if (!user) {
        this.logger.warn(`User not found: ${phoneNumber}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`User found: ${user.name}, current balance: ${user.balance}`);

      const transactions = [];
      let totalCashback = 0;
      let successCount = 0;
      let failedCount = 0;

      // Проходимся по каждому товару
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        this.logger.log(`Processing product ${i + 1}/${productIds.length}: ${productId}`);

        try {
          // Получаем товар
          const product = await this.supabaseService.getProductById(productId);
          this.logger.log(`Product found: ${product.name}, price: ${product.price}`);

          // Рассчитываем кешбек
          const cashbackAmount = Math.round((product.price * this.CASHBACK_PERCENTAGE) * 10) / 10;
          this.logger.log(`Calculated cashback: ${cashbackAmount} (3% of ${product.price}, rounded to 1 decimal)`);

          // Начисляем кешбек пользователю
          this.logger.log('Adding cashback to user...');
          const result = await this.userService.addCashback(phoneNumber, cashbackAmount, {
            productId: product.id,
            productName: product.name,
            productPrice: product.price
          });
          this.logger.log(`Cashback added successfully for product ${product.name}`);

          // Добавляем в массив успешных транзакций
          transactions.push({
            success: true,
            product: {
              id: product.id,
              name: product.name,
              price: product.price
            },
            cashback: {
              amount: cashbackAmount,
              percentage: this.CASHBACK_PERCENTAGE * 100
            },
            transaction: result.transaction
          });

          totalCashback += cashbackAmount;
          successCount++;

        } catch (productError) {
          this.logger.error(`Failed to process product ${productId}: ${productError.message}`);

          // Добавляем в массив неудачных транзакций
          transactions.push({
            success: false,
            productId: productId,
            error: productError.message
          });

          failedCount++;
        }
      }

      // Получаем обновленного пользователя
      const updatedUser = await this.userService.findByPhoneNumber(phoneNumber);

      this.logger.log(`Batch processing completed: ${successCount} successful, ${failedCount} failed, total cashback: ${totalCashback}`);

      return {
        statusCode: 200,
        message: `Processed ${successCount}/${productIds.length} products successfully`,
        data: {
          user: updatedUser,
          summary: {
            totalProducts: productIds.length,
            successfulTransactions: successCount,
            failedTransactions: failedCount,
            totalCashbackAmount: totalCashback
          },
          transactions
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
