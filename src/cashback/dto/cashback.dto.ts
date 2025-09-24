import { IsString, IsNotEmpty, Matches, IsOptional, IsNumber, Min } from 'class-validator';

export class productIds {
  @IsNotEmpty()
  id: string;

  @IsOptional()
  customPrice: number
}

export class ProcessDirectCashbackDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  paymentType: string;

  @IsNotEmpty()
  products: {
    name: string;
    price: number;
  }[];
}

export class ProcessCashbackDto {
  @IsString()
  paymentType: string;

  @IsNotEmpty()
  productId: productIds[];

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class GetProductsDto {
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid format (e.g., +996701234567)'
  })
  phoneNumber?: string;
}

export class SearchProductsDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid format (e.g., +996701234567)'
  })
  phoneNumber?: string;
}

export class DeductCashbackDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid format (e.g., +996701234567)'
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  amount: string; // Передаем как строку для точного парсинга

  @IsString()
  @IsOptional()
  reason?: string; // Причина списания (опционально)
}