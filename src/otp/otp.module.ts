import { Module } from "@nestjs/common";
import { OtpController } from "./otp.controller";
import { OtpService } from "./otp.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    controllers: [OtpController],
    providers: [OtpService],
    imports: [PrismaModule],
    exports: [OtpService]
})
export class OtpModule { }