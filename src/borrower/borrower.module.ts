import { Module } from '@nestjs/common';
import { BorrowerController } from './borrower.controller';
import { BorrowerService } from './borrower.service';
import { PrismaModule } from '../database/prisma/prisma.module';
import { FirebaseService } from '../auth/firebase.service';

@Module({
  imports: [PrismaModule],
  controllers: [BorrowerController],
  providers: [BorrowerService, FirebaseService],
})
export class BorrowerModule {}
