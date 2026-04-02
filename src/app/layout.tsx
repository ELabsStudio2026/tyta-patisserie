import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// NUESTROS COMPONENTES
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import CartFloatingButton from "@/components/CartFloatingButton";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "Tyta Patisserie | Pastelería Boutique en Núñez",
  description: "Descubrí la excelencia y calidad en cada bocado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <Toast /> {/* 2. LO AGREGAMOS ACÁ */}
          <Analytics />
          
          {/* COMENTAMOS ESTOS TRES PARA LIMPIAR LA TIENDA Y EVITAR DUPLICADOS: */}
          {/* <WhatsAppButton /> */}
          {/* <CartDrawer /> */}
          {/* <CartFloatingButton /> */}

        </CartProvider>
      </body>
    </html>
  );
}
