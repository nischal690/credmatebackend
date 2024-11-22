import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { FirebaseService } from '../auth/firebase.service';
import { AuthService } from '../auth/auth.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, FirebaseService, AuthService],
  exports: [UserService],
})
export class UserModule {}
