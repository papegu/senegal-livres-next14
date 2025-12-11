import { Suspense } from "react";

function PaymentSandboxContent({ searchParams }: { searchParams: { method?: string; orderId?: string; amount?: string } }) {
  const method = searchParams.method || "unknown";
  const orderId = searchParams.orderId || "N/A";
  const amount = searchParams.amount || "0";

  const methodNames: Record<string, string> = {
    wave: "Wave",
    orange: "Orange Money",
    ecobank: "Ecobank Card",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4E9CE]">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-[#C0392B] mb-4">Paiement Sandbox</h1>
        <p className="mb-4 text-gray-700">
          Mode sandbox activé. Pour utiliser un vrai processeur de paiement, configurez les clés API dans `.env.local`.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <p className="font-semibold">Méthode: <span className="text-blue-600">{methodNames[method as keyof typeof methodNames] || method}</span></p>
          <p className="text-sm text-gray-600 mt-2">Ordre ID: <code>{orderId}</code></p>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          En production, vous serez redirigé vers la page de paiement du fournisseur.
        </p>

        <div className="flex gap-2">
          <a
            href={orderId !== 'N/A' ? `/payment-success?transactionId=${orderId}&amount=${amount}` : '/'}
            className="flex-1 text-center bg-[#128A41] text-white py-2 rounded hover:bg-black transition"
          >
            Simuler succès
          </a>
          <a
            href={orderId !== 'N/A' ? `/payment-cancel?orderId=${orderId}` : '/'}
            className="flex-1 text-center bg-gray-500 text-white py-2 rounded hover:bg-gray-700 transition"
          >
            Simuler annulation
          </a>
        </div>

        <a href="/" className="mt-4 inline-block text-[#C0392B] text-sm">
          ← Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

export default function PaymentSandboxPage({ searchParams }: { searchParams: { method?: string; orderId?: string } }) {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PaymentSandboxContent searchParams={searchParams} />
    </Suspense>
  );
}
