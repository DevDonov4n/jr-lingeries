import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header/Header";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "JR Lingeries",
  description:
    "Beleza, conforto e delicadeza em cada detalhe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Header />

          {children}
        </CartProvider>
      </body>
    </html>
  );
}