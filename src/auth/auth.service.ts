import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException, Logger } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { OtpService } from "src/otp/otp.service";
import { AdminRegDto, AdminLoginDto, Roles } from "./dto/auth.dto";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private userService: UserService,
        private otpService: OtpService
    ) { }

    async initiateLogin(phoneNumber: string, name: string) {
        try {
            // Проверяем формат номера телефона
            if (!this.isValidPhoneNumber(phoneNumber)) {
                throw new HttpException('Invalid phone number format', HttpStatus.BAD_REQUEST);
            }

            // Проверяем, что имя не пустое
            if (!name || name.trim().length === 0) {
                throw new HttpException('Name is required', HttpStatus.BAD_REQUEST);
            }

            // Создаем или находим пользователя по номеру телефона или имени
            const user = await this.userService.createOrFindByPhoneOrName(phoneNumber, name.trim(), Roles.CLIENT);

            // Генерируем OTP
            const otpCode = await this.otpService.generateOtp(phoneNumber);

            return {
                statusCode: 200,
                message: 'OTP sent successfully',
                user,
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
                    role: user.role,
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

    async adminReg(adminData: AdminRegDto): Promise<any> {
        try {
            this.logger.log(`Attempting to create admin user: ${adminData.phoneNumber}`);

            // Проверяем, существует ли уже пользователь с таким номером
            const existingUser = await this.userService.findByPhoneNumber(adminData.phoneNumber);
            if (existingUser) {
                this.logger.warn(`User already exists: ${adminData.phoneNumber}`);
                throw new ConflictException('User with this phone number already exists');
            }

            const userData = {
                phoneNumber: adminData.phoneNumber,
                password: adminData.password,
                name: adminData.name,
                role: Roles.ADMIN
            };

            this.logger.log(`Creating user with data: ${JSON.stringify(userData, null, 2)}`);

            const createdUser = await this.userService.create(userData);

            this.logger.log(`User created successfully: ${createdUser.id}`);

            // Не возвращаем пароль в ответе
            const { password, ...userWithoutPassword } = createdUser;
            return userWithoutPassword;

        } catch (error) {
            this.logger.error(`Failed to create admin user: ${error.message}`, error.stack);
            
            if (error instanceof ConflictException) {
                throw error;
            }
            
            // Логируем детали ошибки для диагностики
            if (error.code) {
                this.logger.error(`Database error code: ${error.code}`);
            }
            if (error.meta) {
                this.logger.error(`Database error meta: ${JSON.stringify(error.meta)}`);
            }
            
            throw new InternalServerErrorException(`Failed to create admin user: ${error.message}`);
        }
    }

    async adminLogin(loginData: AdminLoginDto): Promise<any> {
        try {
            // Находим пользователя по номеру телефона
            const user = await this.userService.findByPhoneNumber(loginData.phoneNumber);
            
            if (!user) {
                throw new UnauthorizedException('Invalid phone number or password');
            }

            // Проверяем, что это админ
            if (user.role !== Roles.ADMIN) {
                throw new UnauthorizedException('Access denied. Admin role required');
            }

            // Проверяем пароль (простая проверка без хеширования)
            if (user.password !== loginData.password) {
                throw new UnauthorizedException('Invalid phone number or password');
            }

            // Возвращаем данные пользователя без пароля
            const { password, ...userWithoutPassword } = user;
            
            return {
                statusCode: 200,
                message: 'Admin login successful',
                user: userWithoutPassword
            };50

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to process admin login');
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