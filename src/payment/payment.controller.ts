import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

class VerifyPaymentDto {
  paymentId: string;
  orderId: string;
  signature: string;
}

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment and update user metadata' })
  async verifyPayment(@Request() req, @Body() verifyPaymentDto: VerifyPaymentDto) {
    const userId = req.user.id;
    return this.paymentService.verifyPayment(
      verifyPaymentDto.paymentId,
      verifyPaymentDto.orderId,
      verifyPaymentDto.signature,
      userId,
    );
  }
}
