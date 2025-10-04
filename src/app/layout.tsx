import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StackAuthProvider } from "@/lib/contexts/StackAuthContext-approval";
import { ClientProvider } from "@/lib/contexts/ClientContext";
import { KanbanProvider } from "@/lib/contexts/KanbanContext";
import { FinancialProvider } from "@/lib/contexts/FinancialContext";
import { SyncProvider } from "@/lib/contexts/SyncContext";
import { CacheManager } from "@/components/CacheManager";
import { SyncStatus } from "@/components/SyncStatus";

export const dynamic = 'force-dynamic';

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
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
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
        <CacheManager />
        <SyncProvider>
          <StackAuthProvider>
            <ClientProvider>
              <KanbanProvider>
                <FinancialProvider>
                  {children}
                  <SyncStatus />
                </FinancialProvider>
              </KanbanProvider>
            </ClientProvider>
          </StackAuthProvider>
        </SyncProvider>
      </body>
    </html>
  );
}
