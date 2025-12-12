// @ts-ignore - These pages will be used with Wave API webhooks
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PaymentSuccess() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-3xl text-green-600 font-bold">
        ✅ Paiement Wave réussi
      </h1>
    </div>
  );
}
