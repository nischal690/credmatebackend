import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { ReportBorrowerDto } from './dto/report-borrower.dto';
import { FirebaseService } from '../auth/firebase.service';

@Injectable()
export class BorrowerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async reportBorrower(idToken: string, reportData: ReportBorrowerDto) {
    // Verify Firebase token and get phone number
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      throw new UnauthorizedException('Phone number not found in token');
    }

    // Get user ID from database using phone number
    const user = await this.prismaService.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }

    // Create the borrower report
    const report = await this.prismaService.reportedBorrower.create({
      data: {
        reportedByUserId: user.id,
        mobileNumber: reportData.mobileNumber,
        unpaidAmount: reportData.unpaidAmount,
        dueDate: new Date(reportData.dueDate),
        recoveryMode: reportData.recoveryMode,
        confirmedByBorrower: false,
        borrowerCreatedAccount: false,
      },
    });

    return report;
  }
}
