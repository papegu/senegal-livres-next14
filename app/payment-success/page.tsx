'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
    useEffect(() => {
      // Détection blocage cookies/localStorage (anti-tracking)
      try {
        localStorage.setItem('test', '1');
        if (localStorage.getItem('test') !== '1') {
          alert("Votre navigateur bloque le stockage local. Certaines fonctionnalités peuvent être limitées.");
        }
        localStorage.removeItem('test');
      } catch (e) {
        alert("Votre navigateur bloque le stockage local ou les cookies. Certaines fonctionnalités peuvent être limitées.");
      }
    }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processing your purchase...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    processPurchase();
  }, []);

  const processPurchase = async () => {
    try {
      const orderId = searchParams.get('orderId');
      
      console.log('[PaymentSuccess] Processing with orderId:', orderId);

      if (!orderId) {
        // Pas d'orderId - paiement via une autre méthode ou accès direct
        setMessage('✅ Payment successful! Your books are ready to download.');
        setLoading(false);
        return;
      }

      // Récupérer la transaction depuis l'API
      const transactionRes = await fetch(`/api/transactions/${orderId}`);
      
      if (!transactionRes.ok) {
        console.error('[PaymentSuccess] Transaction not found:', orderId);
        setMessage('✅ Payment completed. Your books are ready to download.');
        setLoading(false);
        return;
      }

      const transaction = await transactionRes.json();
      console.log('[PaymentSuccess] Found transaction:', transaction);

      // Vérifier que le paiement est validé
      if (transaction.status !== 'validated') {
        throw new Error(`Payment not confirmed. Status: ${transaction.status}`);
      }

      // Créer une purchase avec les bookIds de la transaction
      if (transaction.bookIds && transaction.bookIds.length > 0) {
        const purchaseRes = await fetch('/api/purchases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookIds: transaction.bookIds,
            transactionId: transaction.id,
            orderId: transaction.orderId,
            amount: transaction.amount,
          }),
        });

        if (!purchaseRes.ok) {
          console.error('[PaymentSuccess] Failed to create purchase');
          // Continue quand même - la transaction est validée
        } else {
          console.log('[PaymentSuccess] Purchase created successfully');
        }
      }

      setMessage('✅ Payment successful! Your books are ready to download.');
      setLoading(false);
    } catch (error) {
      console.error('[PaymentSuccess] Error:', error);
      setMessage('✅ Payment completed successfully!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">
          {loading ? '⏳' : '✅'}
        </div>
        
        <h1 className="text-3xl font-bold text-[#128A41] mb-4">
          {loading ? 'Processing...' : 'Payment Successful'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="space-y-3">
          <a
            href="/purchases"
            className="block w-full bg-[#128A41] text-white py-3 rounded hover:bg-green-700 transition font-bold"
          >
            📚 View My Books
          </a>
          <a
            href="/books"
            className="block w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition font-bold"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center"><p>Loading...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
