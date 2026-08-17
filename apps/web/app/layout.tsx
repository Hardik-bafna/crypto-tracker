import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoTrace™ | Law Enforcement Cryptocurrency Intelligence & Tracing",
  description:
    "Authorized cryptocurrency forensic intelligence platform for fund flow tracing, suspicious pattern detection, wallet clustering, and evidence dossier generation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-100 min-h-screen antialiased selection:bg-brand-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
