import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackathon Seedz · Avaliação",
  description: "Avaliação de candidatos do Programa de Estágio Tech 2026",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00153a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-seedz-navy text-white antialiased">
        {children}
      </body>
    </html>
  );
}
