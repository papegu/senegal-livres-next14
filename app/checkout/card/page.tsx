'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Book } from '@/types/Book';

const StripeCardForm = dynamic(() => import('@/components/StripeCardForm'), {
  ssr: false,
  loading: () => <p>Loading payment form...</p>,
});

interface CartItem {
  book: Book;
}

export default function CardCheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch cart');
      }

      const { cart: cartIds } = await res.json();
      const booksRes = await fetch('/api/books');
      const { books } = await booksRes.json();

      const items = (cartIds || [])
        .map((id: string) => books.find((b: Book) => b.id === id))
        .filter(Boolean)
        .map((book: Book) => ({ book }));

      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.book.price, 0);

  const handlePaymentSuccess = async (token: string) => {
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/payments/ecobank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardToken: token, amount: total }),
      });

      if (!res.ok) throw new Error('Payment failed');

      const { payment_url, transactionId } = await res.json();

      // Redirect to success page with transaction details
      window.location.href = `/payment-success?transactionId=${transactionId}&amount=${total}`;
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[#C0392B] mb-8">💳 Card Payment</h1>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.book.id} className="flex justify-between text-gray-700">
                <span>{item.book.title}</span>
                <span className="font-semibold">{item.book.price} FCFA</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-[#128A41]">{total} FCFA</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Card Details</h2>
          <StripeCardForm
            onPaymentSuccess={handlePaymentSuccess}
            disabled={processing}
          />
          <p className="text-xs text-gray-500 mt-4">
            💳 Your card details are secure and processed by Stripe
          </p>
        </div>

        <div className="mt-6">
          <a
            href="/checkout"
            className="text-[#128A41] hover:underline font-semibold"
          >
            ← Back to Checkout
          </a>
        </div>
      </div>
    </div>
  );
}
