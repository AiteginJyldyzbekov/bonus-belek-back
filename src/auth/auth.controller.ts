import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { InitiateLoginDto, VerifyOtpDto } from "./dto/auth.dto";

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post("login/initiate")
    async initiateLogin(@Body() body: InitiateLoginDto) {
        return await this.authService.initiateLogin(body.phoneNumber);
    }

    @Post("verify-otp")
    async verifyOtp(@Body() body: VerifyOtpDto) {
        return await this.authService.verifyLogin(body.phoneNumber, body.otpCode);
    }
}