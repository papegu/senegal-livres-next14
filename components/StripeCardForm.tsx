"use client";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";

interface StripeCardFormProps {
  onPaymentSuccess: (token: string) => Promise<void>;
  disabled: boolean;
}

export default function StripeCardForm({
  onPaymentSuccess,
  disabled,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  async function handleCreateToken() {
    if (!stripe || !elements) {
      setError("Stripe not initialized");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      return;
    }

    try {
      const { error: stripeError, token } = await stripe.createToken(
        cardElement
      );

      if (stripeError) {
        setError(stripeError.message || "Error creating token");
        return;
      }

      if (token) {
        await onPaymentSuccess(token.id);
      }
    } catch (err) {
      setError("Failed to create card token");
    }
  }

  return (
    <div className="space-y-4">
      <div className="border rounded p-4 bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="button"
        onClick={handleCreateToken}
        disabled={disabled || !stripe}
        className="w-full bg-[#128A41] text-white py-2 rounded font-semibold hover:bg-black transition disabled:bg-gray-400"
      >
        {disabled ? "Traitement..." : "Sécuriser et payer"}
      </button>
    </div>
  );
}
