import { Body, Controller, Post, HttpException, HttpStatus } from "@nestjs/common";
import { OtpService } from "./otp.service";

@Controller('otp')
export class OtpController {
    constructor(private otpService: OtpService) { }

    @Post('/generate')
    async generateOtp(@Body() body: { phoneNumber: string }) {
        try {
            const otpCode = await this.otpService.generateOtp(body.phoneNumber);

            // В реальном приложении здесь должна быть отправка SMS
            // Пока возвращаем код для тестирования
            return {
                statusCode: 200,
                message: 'OTP sent successfully',
                phoneNumber: body.phoneNumber,
            };
        } catch (error) {
            throw new HttpException('Failed to generate OTP', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/verify')
    async verifyOtp(@Body() body: { phoneNumber: string; code: string }) {
        try {
            const isValid = await this.otpService.verifyOtp(body.phoneNumber, body.code);

            if (!isValid) {
                throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
            }

            return {
                statusCode: 200,
                message: 'OTP verified successfully',
                phoneNumber: body.phoneNumber
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to verify OTP', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}