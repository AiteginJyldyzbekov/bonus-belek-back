import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { OtpService } from "src/otp/otp.service";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private otpService: OtpService
    ) { }

    async initiateLogin(phoneNumber: string) {
        try {
            // Проверяем формат номера телефона
            if (!this.isValidPhoneNumber(phoneNumber)) {
                throw new HttpException('Invalid phone number format', HttpStatus.BAD_REQUEST);
            }

            // Создаем или находим пользователя
            const user = await this.userService.createOrFindByPhone(phoneNumber);
            
            // Генерируем OTP
            const otpCode = await this.otpService.generateOtp(phoneNumber);
            
            return {
                statusCode: 200,
                message: 'OTP sent successfully',
                phoneNumber: user.phoneNumber,
                isNewUser: !user.name, // Показываем, новый ли это пользователь
                otp: otpCode // Удалить в продакшене - только для тестирования
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to initiate login', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyLogin(phoneNumber: string, otpCode: string) {
        try {
            // Проверяем формат номера телефона
            if (!this.isValidPhoneNumber(phoneNumber)) {
                throw new HttpException('Invalid phone number format', HttpStatus.BAD_REQUEST);
            }

            // Проверяем формат OTP
            if (!this.isValidOtpCode(otpCode)) {
                throw new HttpException('Invalid OTP format', HttpStatus.BAD_REQUEST);
            }

            // Проверяем OTP
            const isValidOtp = await this.otpService.verifyOtp(phoneNumber, otpCode);
            
            if (!isValidOtp) {
                throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
            }

            // Получаем пользователя
            const user = await this.userService.phoneNumber(phoneNumber);
            
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return {
                statusCode: 200,
                message: 'Login successful',
                user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    name: user.name,
                    createdAt: user.createdAt
                },
                isNewUser: !user.name
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to verify login', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private isValidPhoneNumber(phoneNumber: string): boolean {
        // Простая проверка формата номера телефона
        // Можно настроить под ваши требования
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
    }

    private isValidOtpCode(otpCode: string): boolean {
        // Проверяем, что OTP состоит из 6 цифр
        return /^\d{6}$/.test(otpCode);
    }
}