// database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserRepository } from './repositories/user.repository';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class DatabaseModule {}