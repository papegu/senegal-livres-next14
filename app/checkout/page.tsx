'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/types/Book';

interface CartItem {
  book: Book;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'orange' | 'card' | 'paydunya'>('wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [userBlocked, setUserBlocked] = useState(false);

  useEffect(() => {
    checkUserStatus();
    fetchCart();
  }, []);

  const checkUserStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        if (user.blocked) {
          setUserBlocked(true);
          setError('Your account has been blocked. You cannot make purchases.');
        }
      }
    } catch (err) {
      console.error('Error checking user status:', err);
    }
  };

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    if (userBlocked) {
      setError('Your account has been blocked. You cannot make purchases.');
      setProcessing(false);
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setProcessing(false);
      return;
    }

    try {
      if (selectedMethod === 'wave') {
        const res = await fetch('/api/payments/wave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        });
        
        if (!res.ok) throw new Error('Wave payment failed');
        const { payment_url } = await res.json();
        window.location.href = payment_url;
      } else if (selectedMethod === 'orange') {
        if (!phoneNumber) {
             credentials: 'include',
          setError('Please enter your phone number');
          setProcessing(false);
          return;
        }
        
        const res = await fetch('/api/payments/orange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, phone: phoneNumber }),
        });
        
        if (!res.ok) throw new Error('Orange Money payment failed');
        const { payment_url } = await res.json();
        window.location.href = payment_url;
      } else if (selectedMethod === 'paydunya') {
        // Récupérer l'utilisateur pour l'email
             credentials: 'include',
        const userRes = await fetch('/api/auth/me');
        let customerEmail = '';
        if (userRes.ok) {
          const user = await userRes.json();
          customerEmail = user.email || '';
        }

        const res = await fetch('/api/paydunya/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: total,
            description: `Achat de ${cartItems.length} livre(s)`,
            customerEmail,
            bookIds: cartItems.map(item => item.book.id),
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'PayDunya payment failed');
        }
        
        const { redirect_url } = await res.json();
        if (!redirect_url) throw new Error('No redirect URL received from PayDunya');
        
        window.location.href = redirect_url;
      } else if (selectedMethod === 'card') {
        router.push('/checkout/card');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading checkout...</p>
      </div>
      const userRes = await fetch('/api/auth/me', { credentials: 'include' });
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#C0392B] mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add books to your cart before proceeding to checkout</p>
          <a
            href="/books"
            className="inline-block bg-[#128A41] text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#C0392B] mb-8">🛒 Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.book.id} className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">{item.book.title}</h3>
                        <p className="text-sm text-gray-600">{item.book.author}</p>
                      </div>
                    </div>
                    <p className="font-bold text-[#128A41]">{item.book.price} FCFA</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method & Total */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Total</h3>
              <p className="text-3xl font-bold text-[#128A41]">{total} FCFA</p>
              <p className="text-sm text-gray-600 mt-2">{cartItems.length} book(s)</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="method"
                      value="wave"
                      checked={selectedMethod === 'wave'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'wave')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">📱 Wave</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="method"
                      value="orange"
                      checked={selectedMethod === 'orange'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'orange')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">📱 Orange Money</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="method"
                      value="paydunya"
                      checked={selectedMethod === 'paydunya'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'paydunya')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">💳 PayDunya (Mobile Money, Card)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="method"
                      value="card"
                      checked={selectedMethod === 'card'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'card')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">💳 Card (Ecobank)</span>
                  </label>
                </div>
              </div>

              {selectedMethod === 'orange' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="221701234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#128A41]"
                    required={selectedMethod === 'orange'}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={processing || userBlocked}
                className="w-full bg-[#C0392B] text-white font-bold py-3 rounded hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userBlocked ? 'Account Blocked' : processing ? 'Processing...' : 'Pay Now'}
              </button>

              <a
                href="/cart"
                className="block text-center text-gray-600 hover:text-gray-800 text-sm"
              >
                Back to Cart
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
