import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../database/prisma/prisma.service';
import { FirebaseService } from '../auth/firebase.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, FirebaseService],
  exports: [UserService],
})
export class UserModule {}
