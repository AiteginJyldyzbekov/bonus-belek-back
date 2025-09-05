import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Интерфейс для товара из Supabase
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  [key: string]: any; // Позволяет дополнительные поля
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Supabase error:', error);
        throw new HttpException('Failed to fetch products from database', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }
        throw new HttpException('Failed to fetch product from database', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (!data) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name');
      
      if (error) {
        console.error('Supabase error:', error);
        throw new HttpException('Failed to search products in database', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to search products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Дополнительные методы для работы с товарами (если есть соответствующие поля)
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name');
      
      if (error) {
        console.error('Supabase error:', error);
        throw new HttpException('Failed to fetch products by category', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch products by category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductsInPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .order('price');
      
      if (error) {
        console.error('Supabase error:', error);
        throw new HttpException('Failed to fetch products in price range', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products in price range:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch products in price range', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Метод для проверки подключения к Supabase
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
  }
}
