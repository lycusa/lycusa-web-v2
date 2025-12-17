import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import SignalAutoRegister from "./components/SignalAutoRegister";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lycusa - Sustainable Second-Hand Fashion",
  description: "Buy and sell pre-loved clothing with ease. Join our community of conscious shoppers making fashion sustainable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased font-sans`}
      >
        <SignalAutoRegister />
        {children}
      </body>
    </html>
  );
}
