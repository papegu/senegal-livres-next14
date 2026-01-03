"use client";

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
