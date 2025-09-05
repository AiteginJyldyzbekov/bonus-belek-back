import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CashbackModule } from './cashback/cashback.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, CashbackModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
