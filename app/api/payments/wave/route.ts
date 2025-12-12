export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Missing required field: amount" },
        { status: 400 }
      );
    }

    // Get user from auth token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let userId: number | null = null;

    if (token) {
      try {
        const payload = await verifyJwt(token);
        if (payload) {
          const parsed = Number(payload.sub);
          if (!Number.isNaN(parsed)) {
            userId = parsed;
          }
        }
      } catch (err) {
        console.error("Token verification failed:", err);
      }
    }

    const orderId = uuid();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003";

    // If no API key configured, use sandbox mock URL
    if (!process.env.WAVE_API_KEY || process.env.WAVE_API_KEY === "sandbox_key") {
      const txUuid = uuid();
      const tx = await prisma.transaction.create({
        data: {
          uuid: txUuid,
          orderId,
          userId: userId || null,
          amount: Math.round(Number(amount)),
          paymentMethod: "wave",
          status: "pending",
        },
      });

      return NextResponse.json({
        payment_url: `${baseUrl}/payment-sandbox?method=wave&orderId=${orderId}`,
        order_id: orderId,
        transactionId: tx.uuid || tx.id,
        sandbox: true,
        message: "Using sandbox mode. Add WAVE_API_KEY to .env.local for production.",
      });
    }

    // Call Wave's real API
    const wavePayload = {
      currency: "XOF",
      amount: Math.round(amount),
      error_url: `${baseUrl}/payment-cancel`,
      success_url: `${baseUrl}/payment-success?transactionId=${orderId}&amount=${amount}`,
      metadata: {
        userId: userId || null,
      },
    };

    const waveResponse = await fetch(
      `${process.env.WAVE_BASE_URL || "https://api.waveprod.me/wave/checkout/v1"}/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wavePayload),
      }
    );

    const waveResult = await waveResponse.json();

    if (!waveResponse.ok) {
      console.error("Wave API error:", waveResult);
      return NextResponse.json(
        { error: "Failed to create Wave payment" },
        { status: 400 }
      );
    }

    // Create transaction in DB
    const tx = await prisma.transaction.create({
      data: {
        uuid: uuid(),
        orderId: waveResult.order_id || orderId,
        userId: userId || null,
        amount: Math.round(Number(amount)),
        paymentMethod: "wave",
        status: "pending",
        providerTxId: waveResult.order_id,
      },
    });

    return NextResponse.json({
      payment_url: waveResult.checkout_url,
      order_id: waveResult.order_id,
      transactionId: tx.uuid || tx.id,
    });
  } catch (error) {
    console.error("Wave integration error:", error);
    return NextResponse.json(
      { error: "Server error during Wave integration" },
      { status: 500 }
    );
  }
}
