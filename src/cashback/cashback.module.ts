import { Module } from '@nestjs/common';
import { CashbackController } from './cashback.controller';
import { CashbackService } from './cashback.service';
import { UserModule } from '../user/user.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [UserModule, SupabaseModule, PrismaModule],
  controllers: [CashbackController],
  providers: [CashbackService],
  exports: [CashbackService],
})
export class CashbackModule {}
