'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PayDunyaMockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoiceToken, setInvoiceToken] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(true);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const token = searchParams.get('token');
    const order = searchParams.get('orderId');
    const amt = searchParams.get('amount');

    if (token) setInvoiceToken(token);
    if (order) setOrderId(order);
    if (amt) setAmount(Number(amt));
  }, [searchParams]);

  const handleConfirmPayment = async () => {
    setProcessing(true);
    setShowConfirm(false);

    try {
      // Simuler l'appel à PayDunya callback
      const callbackUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Envoyer la notification de paiement validé au webhook
      const response = await fetch(`${callbackUrl}/api/paydunya/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_code: '00',
          status: 'completed',
          invoice: {
            token: invoiceToken,
            custom_data: {
              orderId,
            },
          },
          custom_data: {
            orderId,
          },
        }),
      });

      if (response.ok) {
        // Rediriger vers la page de succès après 2 secondes
        setTimeout(() => {
          router.push('/payment-success');
        }, 2000);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setShowConfirm(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelPayment = () => {
    router.push('/payment-cancel');
  };

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#128A41] text-center mb-6">
          🏦 PayDunya Mock Payment
        </h1>

        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800">
            <strong>Mode de test:</strong> Ceci est une page de paiement simulée pour tester le flux PayDunya en développement.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Invoice Token
            </label>
            <input
              type="text"
              value={invoiceToken}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Commande ID
            </label>
            <input
              type="text"
              value={orderId}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Montant
            </label>
            <div className="text-2xl font-bold text-[#128A41]">
              {amount} FCFA
            </div>
          </div>
        </div>

        {showConfirm ? (
          <div className="space-y-3">
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="w-full bg-[#128A41] text-white font-bold py-3 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? '⏳ Traitement...' : '✓ Confirmer le paiement'}
            </button>
            <button
              onClick={handleCancelPayment}
              disabled={processing}
              className="w-full bg-gray-500 text-white font-bold py-3 rounded hover:bg-gray-700 transition disabled:opacity-50"
            >
              ✗ Annuler
            </button>
          </div>
        ) : (
          <div className="text-center">
            {processing ? (
              <div>
                <p className="text-gray-600 mb-4">⏳ Traitement du paiement...</p>
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#128A41] border-r-transparent"></div>
              </div>
            ) : (
              <p className="text-green-600 font-semibold">✓ Paiement validé! Redirection...</p>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded text-sm text-gray-600">
          <p className="font-semibold mb-2">Détails téchniques:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cette page simule le formulaire de paiement PayDunya</li>
            <li>Cliquez "Confirmer" pour simuler un paiement réussi</li>
            <li>Le webhook sera appelé automatiquement</li>
            <li>Vous serez redirigé vers /payment-success</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PayDunyaMockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center"><p>Chargement...</p></div>}>
      <PayDunyaMockContent />
    </Suspense>
  );
}
