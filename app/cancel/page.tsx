export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4E9CE]">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-[#C0392B]">Paiement annulé</h1>
        <p className="mt-4">Le paiement a été annulé. Vous pouvez réessayer.</p>
        <a className="mt-4 inline-block text-[#128A41] font-semibold" href="/">Retour à l'accueil</a>
      </div>
    </div>
  );
}
