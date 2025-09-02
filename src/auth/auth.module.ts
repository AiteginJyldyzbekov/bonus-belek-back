import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { OtpModule } from "src/otp/otp.module";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [UserModule, OtpModule],
    exports: [AuthService]
})
export class AuthModule { }