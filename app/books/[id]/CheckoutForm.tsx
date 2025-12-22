"use client";

import React, { useState } from "react";

export default function CheckoutForm({ bookId, price }: { bookId: string; price: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // PayDunya est la méthode principale
      const res = await fetch("/api/paydunya/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: price, 
          description: `Achat d'un livre`,
          bookIds: [bookId],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment creation failed");
        setLoading(false);
        return;
      }

      const redirectUrl = data.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setError("Payment initiated but no redirect URL received");
        setLoading(false);
      }
    } catch (err) {
      setError("Server error");
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="mt-6 border-t pt-4">
      <p className="mb-4 text-lg">Montant: <strong className="text-[#128A41]">{price} €</strong></p>

      <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded">
        <p className="text-blue-800">
          💳 <strong>Paiement PayDunya Sécurisé</strong><br />
          Vous serez redirigé vers PayDunya pour compléter votre paiement (Mobile Money, Carte bancaire, etc.).
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-[#128A41] text-white py-3 px-4 rounded font-semibold hover:bg-black transition disabled:bg-gray-400 text-lg"
      >
        {loading ? "⏳ Redirection..." : `✓ Payer ${price} €`}
      </button>

      {error && <p className="text-red-600 mt-3 text-center font-semibold">{error}</p>}
    </form>
  );
}
