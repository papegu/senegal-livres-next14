export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function PaymentCancelPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams?.orderId || "";
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Paiement annulé</h1>
        <p className="text-gray-700">Votre paiement a été annulé ou n'a pas abouti.</p>
        {orderId && (
          <p className="text-sm text-gray-600">Référence commande: {orderId}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-4 py-2 rounded bg-gray-700 text-white">
            Retour à l'accueil
          </Link>
          <Link href="/books" className="px-4 py-2 rounded bg-blue-600 text-white">
            Réessayer l'achat
          </Link>
        </div>
      </div>
    </main>
  );
}
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
