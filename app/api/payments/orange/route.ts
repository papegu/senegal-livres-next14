import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { amount, phone } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Missing required field: amount" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required for Orange Money" },
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
    if (!process.env.ORANGE_API_KEY || process.env.ORANGE_API_KEY === "sandbox_key") {
      const tx = await prisma.transaction.create({
        data: {
          uuid: uuid(),
          orderId,
          userId: userId || null,
          amount: Math.round(Number(amount)),
          paymentMethod: "orange",
          status: "pending",
        },
      });

      return NextResponse.json({
        payment_url: `${baseUrl}/payment-sandbox?method=orange&orderId=${orderId}`,
        order_id: orderId,
        transactionId: tx.uuid || tx.id,
        sandbox: true,
        message: "Using sandbox mode. Add ORANGE_API_KEY to .env.local for production.",
      });
    }

    // Call Orange Money's API
    const orangePayload = {
      merchant_key: process.env.ORANGE_MERCHANT_KEY,
      amount: Math.round(amount),
      currency: "XOF",
      order_id: orderId,
      customer_msisdn: phone,
      merchant_reference: uuid(),
      notif_url: `${baseUrl}/api/payments/webhook`,
      return_url: `${baseUrl}/payment-success?transactionId=${orderId}&amount=${amount}`,
      cancel_url: `${baseUrl}/payment-cancel`,
    };

    const orangeResponse = await fetch(
      `${process.env.ORANGE_API_URL || "https://api.orange.sn/payment/v1"}/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ORANGE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orangePayload),
      }
    );

    const orangeResult = await orangeResponse.json();

    if (!orangeResponse.ok) {
      console.error("Orange Money API error:", orangeResult);
      return NextResponse.json(
        { error: "Failed to create Orange Money payment" },
        { status: 400 }
      );
    }

    // Create transaction in DB
    const tx = await prisma.transaction.create({
      data: {
        uuid: uuid(),
        orderId: orangeResult.order_id || orderId,
        userId: userId || null,
        amount: Math.round(Number(amount)),
        paymentMethod: "orange",
        status: "pending",
        providerTxId: orangeResult.order_id,
      },
    });

    return NextResponse.json({
      payment_url: orangeResult.checkout_url || orangeResult.payment_url,
      order_id: orangeResult.order_id,
      transactionId: tx.uuid || tx.id,
    });
  } catch (error) {
    console.error("Orange Money integration error:", error);
    return NextResponse.json(
      { error: "Server error during Orange Money integration" },
      { status: 500 }
    );
  }
}
