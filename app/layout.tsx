import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import SignalAutoRegister from "./components/SignalAutoRegister";
import KycProvider from "./components/providers/KycProvider";
import SWRProvider from "./components/providers/SWRProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
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
        className={`${manrope.variable} antialiased font-sans`}
      >
        <KycProvider>
          <SWRProvider>
            <SignalAutoRegister />
            {children}
          </SWRProvider>
        </KycProvider>
      </body>
    </html>
  );
}
