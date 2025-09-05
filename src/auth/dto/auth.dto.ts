import { IsString, IsNotEmpty, Length, Matches, IsOptional } from 'class-validator';

export class InitiateLoginDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in valid format (e.g., +1234567890 or 1234567890)'
    })
    phoneNumber: string;
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in valid format (e.g., +1234567890 or 1234567890)'
    })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
    @Matches(/^\d{6}$/, { message: 'OTP code must contain only digits' })
    otpCode: string;
}

// Используем те же значения, что и в Prisma enum UserRole
export enum Roles {
    CLIENT = "CLIENT",
    ADMIN = "ADMIN"
}

export class AdminRegDto {
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in valid format (e.g., +996701234567)'
    })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class AdminLoginDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in valid format (e.g., +996701234567)'
    })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class CreateUserDto {
    phoneNumber: string;
    @IsOptional()
    password?: string; // Пароль опциональный для клиентов
    name: string;
    role: Roles;
}