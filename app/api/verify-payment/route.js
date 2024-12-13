import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = body;

    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return new NextResponse("Invalid payment signature", { status: 400 });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update user's metadata with payment information
    await db.user.update({
      where: {
        id: userId
      },
      data: {
        metadata: {
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          payment_status: payment.status,
          payment_amount: payment.amount,
          payment_currency: payment.currency,
          payment_method: payment.method,
          payment_date: new Date(payment.created_at * 1000)
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully"
    });

  } catch (error) {
    console.error("PAYMENT_VERIFICATION_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 