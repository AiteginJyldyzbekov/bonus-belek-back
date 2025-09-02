
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async phoneNumber(phoneNumber: string) {
        return this.prisma.user.findUnique({
            where: { phoneNumber },
        });
    }

    async create(data: { phoneNumber: string; password?: string, name?: string }) {
        return this.prisma.user.create({
            data,
        });
    }

    async update(id: number, data: { name?: string; password?: string }) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async createOrFindByPhone(phoneNumber: string) {
        let user = await this.phoneNumber(phoneNumber);
        
        if (!user) {
            user = await this.create({ phoneNumber });
        }
        
        return user;
    }
}