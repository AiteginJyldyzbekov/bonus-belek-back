import { Controller, Get, Param, Post, Body, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller('users')
@UsePipes(new ValidationPipe())
export class UserController {
    constructor(private userService: UserService) { }

    @Get(':phone/balance')
    async getBalance(@Param('phone') phone: string) {
        return await this.userService.getBalance(phone);
    }

    @Get(':phone/transactions')
    async getTransactions(@Param('phone') phone: string) {
        return await this.userService.getTransactions(phone);
    }

    @Get(':phone/profile')
    async getUserProfile(@Param('phone') phone: string) {
        return await this.userService.getUserProfile(phone);
    }

    @Post(':phone/role')
    async setUserRole(
        @Param('phone') phone: string,
        @Body() body: { role: 'CLIENT' | 'ADMIN' }
    ) {
        return await this.userService.setUserRole(phone, body.role);
    }
}
