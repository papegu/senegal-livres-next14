export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function PaymentSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams?.orderId || "";
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Paiement réussi</h1>
        <p className="text-gray-700">
          Merci pour votre achat. Votre paiement a été validé.
        </p>
        {orderId && (
          <p className="text-sm text-gray-600">Référence commande: {orderId}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-4 py-2 rounded bg-green-600 text-white">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
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
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({ phone: '', whatsapp: '', address: '' });
  const [deliverySubmitted, setDeliverySubmitted] = useState(false);

  useEffect(() => {
    processPurchase();
  }, []);

  const processPurchase = async () => {
    try {
      const orderId = searchParams.get('orderId');
      
      console.log('[PaymentSuccess] Processing with orderId:', orderId);

      if (!orderId) {
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

      if (transaction.status !== 'validated') {
        throw new Error(`Payment not confirmed. Status: ${transaction.status}`);
      }

      // Demander les infos de livraison si pas déjà soumises
      setShowDeliveryForm(true);
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
        <div className="text-5xl mb-4">{loading ? '⏳' : '✅'}</div>
        <h1 className="text-3xl font-bold text-[#128A41] mb-4">{loading ? 'Processing...' : 'Payment Successful'}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {showDeliveryForm && !deliverySubmitted ? (
          <>
            <form
              className="space-y-4 text-left"
              onSubmit={async (e) => {
                e.preventDefault();
                setDeliverySubmitted(true);
                setShowDeliveryForm(false);
                setMessage('✅ Merci ! Vos informations de livraison ont été enregistrées.');
              }}
            >
              <div>
                <label className="block text-sm font-semibold mb-1">Numéro WhatsApp</label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={deliveryInfo.whatsapp}
                  onChange={e => setDeliveryInfo(info => ({ ...info, whatsapp: e.target.value }))}
                  placeholder="Ex: 77 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Adresse de livraison</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={deliveryInfo.address}
                  onChange={e => setDeliveryInfo(info => ({ ...info, address: e.target.value }))}
                  placeholder="Votre adresse complète"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#128A41] text-white py-3 rounded hover:bg-green-700 transition font-bold"
              >
                Envoyer
              </button>
            </form>
            {/* Chatbox marchandage et contact admin (à intégrer dans une vraie app de chat ou via un service externe) */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">💬 Marchander ou discuter avec l'administrateur</h2>
              <div className="border rounded p-4 bg-gray-50">
                <p className="mb-2 text-gray-700">Vous pouvez discuter du prix, négocier les frais de transport si vous êtes hors de Dakar, ou demander à l'administrateur de rechercher des livres spécifiques pour vous.</p>
                <div className="mb-2">
                  <input type="text" className="w-full px-3 py-2 border rounded mb-2" placeholder="Votre message..." />
                  <button className="bg-[#128A41] text-white px-4 py-2 rounded font-bold w-full">Envoyer</button>
                </div>
                <div className="text-xs text-gray-500">(Chatbox démo, à connecter à un backend ou service de chat pour la production)</div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <a
              href="/purchases"
              className="block w-full bg-[#128A41] text-white py-3 rounded hover:bg-green-700 transition font-bold"
            >
              📚 Voir mes livres
            </a>
            <a
              href="/books"
              className="block w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition font-bold"
            >
              Continuer mes achats
            </a>
          </div>
        )}
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
