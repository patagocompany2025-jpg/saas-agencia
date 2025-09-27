import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StackAuthProvider } from "@/lib/contexts/StackAuthContext-approval";
import { ClientProvider } from "@/lib/contexts/ClientContext";
import { KanbanProvider } from "@/lib/contexts/KanbanContext";
import { FinancialProvider } from "@/lib/contexts/FinancialContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agência Patagonian - Sistema de Gestão",
  description: "Sistema completo de gestão para agência de viagens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackAuthProvider>
          <ClientProvider>
            <KanbanProvider>
              <FinancialProvider>
                {children}
              </FinancialProvider>
            </KanbanProvider>
          </ClientProvider>
        </StackAuthProvider>
      </body>
    </html>
  );
}
