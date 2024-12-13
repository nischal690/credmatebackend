import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { PrismaService } from '../database/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('NEXT_PUBLIC_RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string, userId: string) {
    try {
      // Verify the payment signature
      const body = JSON.stringify({
        payment_id: paymentId,
        order_id: orderId
      });
      
      const expectedSignature = crypto
        .createHmac('sha256', this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET'))
        .update(body)
        .digest('hex');
        
      const isValid = expectedSignature === signature;
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Get payment details from Razorpay
      const payment = await this.razorpay.payments.fetch(paymentId);

      if (payment.status !== 'captured') {
        throw new Error('Payment not captured');
      }

      // Update user metadata with payment information
      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          metadata: {
            update: {
              lastPaymentId: paymentId,
              lastPaymentAmount: payment.amount,
              lastPaymentStatus: payment.status,
              lastPaymentDate: new Date(),
              paymentHistory: {
                push: {
                  paymentId,
                  amount: payment.amount,
                  status: payment.status,
                  date: new Date(),
                  orderId,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: 'Payment verified successfully',
        payment: {
          id: paymentId,
          amount: payment.amount,
          status: payment.status,
          orderId,
        },
      };
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }
}
