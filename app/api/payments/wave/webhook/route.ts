export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log("Webhook Wave received:", payload);

    if (payload.status === "SUCCESS") {
      console.log("Payment successful for order:", payload.order_id);
    } else if (payload.status === "FAILED") {
      console.log("Payment failed for order:", payload.order_id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

