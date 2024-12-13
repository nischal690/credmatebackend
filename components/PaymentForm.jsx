import { useState } from 'react';
import { toast } from 'react-hot-toast';

const PaymentForm = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (amount) => {
    try {
      setLoading(true);
      
      // First create order
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        handler: async function (response) {
          try {
            await verifyPayment(response);
            toast.success("Payment successful!");
            // Handle post-payment logic (e.g., redirect)
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (response) => {
    const res = await fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });

    if (!res.ok) {
      throw new Error("Payment verification failed");
    }

    return await res.json();
  };

  return (
    <div>
      <button 
        onClick={() => handlePayment(1000)} 
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

export default PaymentForm; 