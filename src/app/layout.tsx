import type { Metadata } from "next";
import { Inter, Noto_Sans_Gujarati, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const gujarati = Noto_Sans_Gujarati({
  variable: "--font-gujarati",
  subsets: ["gujarati"],
  weight: ["400", "500", "600", "700"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VrikshaMitra - Agroforestry Advisor for Gujarat Farmers",
  description: "AI-powered agroforestry advisory platform for farmers in Gujarat. Choose the right boundary trees, estimate income, and link to government schemes like Har Medh Par Ped.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="gu"
      className={`${inter.variable} ${gujarati.variable} ${devanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50/50 text-stone-850 font-sans">
        <AppProvider>
          <Navigation />
          <main className="flex-1 pb-24 md:pb-8 max-w-6xl w-full mx-auto px-4 py-6">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
