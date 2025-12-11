import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/utils/fileDb";
import { v4 as uuid } from "uuid";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { amount, cardToken } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Missing required field: amount" },
        { status: 400 }
      );
    }

    // Get user from auth token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let userId = null;

    if (token) {
      try {
        const payload = await verifyJwt(token);
        if (payload) {
          userId = payload.sub;
        }
      } catch (err) {
        console.error("Token verification failed:", err);
      }
    }

    const orderId = uuid();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003";

    // If no API key configured, use sandbox mock
    if (!process.env.ECOBANK_API_KEY || process.env.ECOBANK_API_KEY === "sandbox_key") {
      const db = await readDB();
      db.transactions = db.transactions || [];

      const tx = {
        id: uuid(),
        orderId,
        userId: userId || null,
        amount,
        paymentMethod: "ecobank",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      db.transactions.push(tx);
      await writeDB(db);

      return NextResponse.json({
        payment_url: `${baseUrl}/payment-sandbox?method=ecobank&orderId=${orderId}`,
        order_id: orderId,
        transactionId: tx.id,
        sandbox: true,
        message: "Using sandbox mode. Add ECOBANK_API_KEY to .env.local for production.",
      });
    }

    // Call Ecobank's API
    const ecobankPayload = {
      amount: Math.round(amount),
      currency: "XOF",
      card_token: cardToken,
      order_id: orderId,
      merchant_id: process.env.ECOBANK_MERCHANT_ID,
      return_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/payment-cancel`,
    };

    const ecobankResponse = await fetch(
      `${process.env.ECOBANK_API_URL || "https://api.ecobank.sn/payment/v1"}/charge`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ECOBANK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ecobankPayload),
      }
    );

    const ecobankResult = await ecobankResponse.json();

    if (!ecobankResponse.ok) {
      console.error("Ecobank API error:", ecobankResult);
      return NextResponse.json(
        { error: "Failed to process Ecobank payment" },
        { status: 400 }
      );
    }

    // Create transaction in DB
    const db = await readDB();
    db.transactions = db.transactions || [];

    const tx = {
      id: uuid(),
      orderId: ecobankResult.order_id || orderId,
      userId: userId || null,
      amount,
      paymentMethod: "ecobank",
      status: ecobankResult.status || "pending",
      ecobankTransactionId: ecobankResult.transaction_id,
      createdAt: new Date().toISOString(),
    };

    db.transactions.push(tx);
    await writeDB(db);

    if (ecobankResult.status === "success" || ecobankResult.status === "completed") {
      return NextResponse.json({
        success: true,
        order_id: ecobankResult.order_id,
        transactionId: tx.id,
        redirect_url: `${baseUrl}/payment-success?transactionId=${tx.id}&amount=${amount}`,
      });
    }

    return NextResponse.json({
      payment_url: ecobankResult.payment_url || ecobankResult.checkout_url,
      order_id: ecobankResult.order_id,
      transactionId: tx.id,
    });
  } catch (error) {
    console.error("Ecobank integration error:", error);
    return NextResponse.json(
      { error: "Server error during Ecobank payment processing" },
      { status: 500 }
    );
  }
}
