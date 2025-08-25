import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
// 1. Importer le SupabaseProvider
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { AuthProvider } from '@/components/providers/AuthProvider' // 1. Importer
import { Navbar } from '@/components/layout/Navbar' // 1. Importer la Navbar
import { AppApolloProvider } from '@/components/providers/ApolloProvider' // 1. Importer


export const metadata: Metadata = {
  title: "Swim Training",
  description: "Créez vos entraînements de natation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SupabaseProvider>
          <AppApolloProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
                  {children}
                </main>
              </div>
            </AuthProvider>
          </AppApolloProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
