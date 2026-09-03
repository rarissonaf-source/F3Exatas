import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { AuthGate } from "@/components/auth-gate";
import { BASE_PATH } from "@/lib/base-path";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "F3 Provas",
  description:
    "Repositório de provas de vestibular por instituição, disciplina e assunto — parte da rede F3 Exatas.",
  icons: {
    icon: `${BASE_PATH}/brand/f3-logo.jpg`,
    apple: `${BASE_PATH}/brand/f3-logo.jpg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${lato.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthGate />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
