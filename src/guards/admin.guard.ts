import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const phoneNumber = request.body?.phoneNumber;

    if (!phoneNumber) {
      throw new UnauthorizedException('Phone number is required in request body');
    }

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }

    // Добавляем пользователя в request для использования в контроллерах
    request.user = user;
    return true;
  }
}
