import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AdminRegDto, AdminLoginDto, InitiateLoginDto, VerifyOtpDto } from "./dto/auth.dto";

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post("login/initiate")
    async initiateLogin(@Body() body: InitiateLoginDto) {
        return await this.authService.initiateLogin(body.phoneNumber, body.name);
    }

    @Post("verify-otp")
    async verifyOtp(@Body() body: VerifyOtpDto) {
        return await this.authService.verifyLogin(body.phoneNumber, body.otpCode);
    }

    @Post("login/admin")
    async adminLogin(@Body() body: AdminLoginDto) {
        return await this.authService.adminLogin(body);
    }

    @Post("registration/admin")
    async adminReg(@Body() body: AdminRegDto): Promise<{ message: string; user: any }> {
        const user = await this.authService.adminReg(body);
        return {
            message: 'Admin successfully created',
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                name: user.name,
                role: user.role
            }
        };
    }
}