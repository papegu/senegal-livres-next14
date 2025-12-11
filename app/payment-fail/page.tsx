export default function PaymentFail() {
  return (
    <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-4xl text-red-600 font-bold mb-4">
          ❌ Paiement échoué
        </h1>
        <p className="text-gray-700 mb-6">
          Votre paiement n'a pas été complété. Veuillez réessayer.
        </p>
        <a
          href="/checkout"
          className="inline-block bg-[#128A41] text-white px-6 py-2 rounded font-semibold hover:bg-black transition"
        >
          Retour au paiement
        </a>
      </div>
    </div>
  );
}
