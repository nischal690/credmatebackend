import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../database/prisma/prisma.module';
import { FirebaseService } from '../auth/firebase.service';
import { AuthService } from '../auth/auth.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [PrismaModule, SearchModule],
  controllers: [UserController],
  providers: [UserService, FirebaseService, AuthService],
  exports: [UserService],
})
export class UserModule {}
