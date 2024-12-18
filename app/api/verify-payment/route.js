import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error from backend:", error);
      return new NextResponse(error, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error("PAYMENT_VERIFICATION_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
