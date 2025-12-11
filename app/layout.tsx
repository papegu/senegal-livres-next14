import type { Metadata } from "next";
import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { StripeProvider } from "@/components/StripeProvider";

export const metadata: Metadata = {
  title: "Sénégal Livres",
  description: "Librairie numérique 100% sénégalaise",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#F4E9CE] text-black">
        <Header />
        <main className="min-h-screen">
          <StripeProvider>
            {children}
          </StripeProvider>
        </main>
        <Footer />
      </body>
    </html>
  );
}
