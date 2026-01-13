import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#DDDDDD" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "Lycusa",
  description: "Buy and sell pre-loved clothing with ease. Join our community of conscious shoppers making fashion sustainable.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lycusa",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${manrope.variable} antialiased font-sans min-h-dvh overscroll-none`}
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
