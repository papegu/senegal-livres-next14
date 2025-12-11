"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

// Create stripe promise only if key is available; otherwise use null
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
  : Promise.resolve(null);

export function StripeProvider({ children }: { children: ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
