import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OtpService {
    constructor(private prismaService: PrismaService) { }

    private generateOtpCode(): string {
        const arr = [];
        for (let i = 0; i < 6; i++) {
            const curr = Math.floor(Math.random() * 10);
            arr.push(curr);
        }
        return arr.join('');
    }

    async generateOtp(phoneNumber: string): Promise<string> {
        try {
            // Проверяем, не слишком ли много попыток за последние 5 минут
            const recentOtps = await this.prismaService.oTP.count({
                where: {
                    phoneNumber,
                    createdAt: {
                        gte: new Date(Date.now() - 5 * 60 * 1000) // Последние 5 минут
                    }
                }
            });

            if (recentOtps >= 3) {
                throw new HttpException('Too many OTP requests. Please wait before requesting another code.', HttpStatus.TOO_MANY_REQUESTS);
            }

            // Удаляем старые неиспользованные OTP для этого номера
            await this.prismaService.oTP.deleteMany({
                where: {
                    phoneNumber,
                    OR: [
                        { isUsed: true },
                        { expiresAt: { lt: new Date() } }
                    ]
                }
            });

            // Генерируем новый OTP
            const otpCode = this.generateOtpCode();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

            axios.post("http://31.3.216.144:3000/api/whatsapp/send-otp", {
                phoneNumber,
                otpCode
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "slb9ZjX1kMnIFmeD-mAYb5cgEBLpWmCyj"
                }
            })
                .then(response => {
                    console.log('OTP sent successfully:', response.data);
                })
                .catch(error => {
                    console.error('Error sending OTP:', error);
                });



            // Сохраняем OTP в базу данных
            await this.prismaService.oTP.create({
                data: {
                    phoneNumber,
                    code: otpCode,
                    expiresAt,
                    isUsed: false
                }
            });

            return otpCode;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to generate OTP', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
        try {
            const otp = await this.prismaService.oTP.findFirst({
                where: {
                    phoneNumber,
                    code,
                    isUsed: false,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            if (!otp) {
                return false;
            }

            // Помечаем OTP как использованный
            await this.prismaService.oTP.update({
                where: { id: otp.id },
                data: { isUsed: true }
            });

            return true;
        } catch (error) {
            throw new HttpException('Failed to verify OTP', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cleanupExpiredOtps(): Promise<void> {
        try {
            await this.prismaService.oTP.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { isUsed: true }
                    ]
                }
            });
        } catch (error) {
            console.error('Failed to cleanup expired OTPs:', error);
        }
    }

    sendOtpWhatsApp(phoneNumber: string, otpCode: string) {
        axios.post("http://192.168.0.104:3000/api/whatsapp/send-otp", {
            phoneNumber,
            otpCode
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "slb9ZjX1kMnIFmeD-mAYb5cgEBLpWmCyj"
            }
        })
            .then(response => {
                console.log('OTP sent successfully:', response.data);
            })
            .catch(error => {
                console.error('Error sending OTP:', error);
            });
    }

    // Метод для получения информации о последнем OTP (для отладки)
    async getLastOtp(phoneNumber: string) {
        return await this.prismaService.oTP.findFirst({
            where: { phoneNumber },
            orderBy: { createdAt: 'desc' }
        });
    }
}