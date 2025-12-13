"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/auth/logout", { method: "POST", credentials: 'include' });
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        router.push("/");
      }
    }

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4E9CE]">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-[#C0392B]">Déconnexion...</h1>
        <p className="mt-4 text-gray-600">Vous serez redirigé vers l'accueil.</p>
      </div>
    </div>
  );
}
