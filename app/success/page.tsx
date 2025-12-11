export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4E9CE]">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-[#128A41]">Paiement réussi</h1>
        <p className="mt-4">Merci pour votre achat. Votre commande est en cours de traitement.</p>
        <a className="mt-4 inline-block text-[#C0392B] font-semibold" href="/">Retour à l'accueil</a>
      </div>
    </div>
  );
}
