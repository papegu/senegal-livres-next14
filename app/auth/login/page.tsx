"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        setLoading(false);
        return;
      }

      // cookie auth_token est posé côté serveur
      // notify other windows/components that auth changed and navigate home
      try {
        window.dispatchEvent(new Event('auth-change'));
      } catch (e) {
        // ignore (server-side rendering safety)
      }

      // Navigate to home then force a full reload so server-rendered UI (header, pages)
      // picks up the HttpOnly cookie immediately without requiring a manual refresh.
      router.push("/");
      // small delay to ensure cookie from server is set, then reload
      setTimeout(() => {
        try {
          window.location.reload();
        } catch (e) {
          // ignore
        }
      }, 250);
    } catch (err) {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4E9CE]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-[#C0392B] mb-6">
          Connexion
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="border p-2 w-full rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#128A41] text-white p-2 rounded font-semibold hover:bg-black transition"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
        )}

        <p className="text-center text-sm mt-4">
          Pas encore de compte ?{" "}
          <a
            href="/auth/register"
            className="text-[#C0392B] font-semibold"
          >
            Créer un compte
          </a>
        </p>
      </form>
    </div>
  );
}
