import { CartProvider } from "@/context/CartContext";
import Toast from "@/components/Toast";
import "./globals.css"; // Asegúrate de que esta ruta sea correcta

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>
          {children}
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}