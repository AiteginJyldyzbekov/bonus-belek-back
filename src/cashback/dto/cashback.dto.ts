import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class ProcessCashbackDto {
  @IsNotEmpty()
  productId: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid format (e.g., +996701234567)'
  })
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
