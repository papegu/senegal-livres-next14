"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Tx = {
  orderId: string;
  amount: number;
  status: string;
  paydunyaInvoiceToken?: string;
  paymentConfirmedAt?: string;
};

export default function PaymentSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams?.orderId || "";
  const [tx, setTx] = useState<Tx | null>(null);
  const [loading, setLoading] = useState<boolean>(!!orderId);

  useEffect(() => {
    const run = async () => {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/transactions/${orderId}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setTx({
            orderId: data.orderId,
            amount: data.amount,
            status: data.status,
            paydunyaInvoiceToken: data.paydunyaInvoiceToken,
            paymentConfirmedAt: data.paymentConfirmedAt,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [orderId]);

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

        {loading && (
          <p className="text-gray-500 text-sm">Chargement des détails…</p>
        )}

        {!loading && tx && (
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            {(() => {
              const XOF_PER_EUR = Number(process.env.NEXT_PUBLIC_XOF_PER_EUR ?? '655.957');
              const eur = Number(tx.amount || 0);
              const xof = Math.round(eur * XOF_PER_EUR);
              return (
                <p>
                  Montant:
                  {' '}
                  <span className="font-semibold text-green-700">{eur.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                  {' '}
                  <span className="text-gray-500">(~{xof.toLocaleString()} FCFA)</span>
                </p>
              );
            })()}
            <p>Statut: <span className="font-semibold text-green-700">{tx.status}</span></p>
            {tx.paymentConfirmedAt && (
              <p>Confirmé le: {new Date(tx.paymentConfirmedAt).toLocaleString()}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-4 py-2 rounded bg-green-600 text-white">
            Retour à l'accueil
          </Link>
          <Link href="/purchases" className="px-4 py-2 rounded bg-blue-600 text-white">
            Voir mes achats
          </Link>
        </div>
      </div>
    </main>
  );
}
