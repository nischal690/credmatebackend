import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../database/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [AuthService, FirebaseService],
  exports: [AuthService, FirebaseService],
  controllers: [AuthController],
})
export class AuthModule {}
