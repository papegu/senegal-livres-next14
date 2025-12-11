'use client';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        
        <h1 className="text-3xl font-bold text-[#C0392B] mb-4">Payment Cancelled</h1>

        <p className="text-gray-600 mb-6">
          Your payment was cancelled. Your cart items are still saved, and you can retry payment anytime.
        </p>

        <div className="space-y-3">
          <a
            href="/checkout"
            className="block w-full bg-[#C0392B] text-white py-3 rounded hover:bg-black transition font-bold"
          >
            Try Again
          </a>
          <a
            href="/cart"
            className="block w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition font-bold"
          >
            Back to Cart
          </a>
        </div>
      </div>
    </div>
  );
}
