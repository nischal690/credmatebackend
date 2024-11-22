import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseService],
  exports: [AuthService],
})
export class AuthModule {}
