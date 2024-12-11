import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { BorrowerService } from './borrower.service';
import { ReportBorrowerDto } from './dto/report-borrower.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('borrower')
@Controller('borrower')
export class BorrowerController {
  constructor(private readonly borrowerService: BorrowerService) {}

  @Post('report_borrower')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a borrower for unpaid amount' })
  @ApiResponse({ status: 201, description: 'Borrower reported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reportBorrower(
    @Headers('authorization') idToken: string,
    @Body() reportData: ReportBorrowerDto,
  ) {
    // Remove 'Bearer ' prefix if present
    const token = idToken.replace('Bearer ', '');
    return this.borrowerService.reportBorrower(token, reportData);
  }
}
