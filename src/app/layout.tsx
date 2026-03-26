import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  
  
//  metadataBase: new URL("https://tyta-patisserie.vercel.app"),
  metadataBase: new URL("https://tyta-patisserie.vercel.app"), // <--- ¡Faltaba esta coma!
// Título que aparece en la pestaña y en Google
  title: "Tyta Patisserie | Excelencia y Calidad en CABA", 
  
  // Descripción optimizada con palabras clave críticas
  description: "Disfruta de la auténtica patisserie artesanal en el corazón de Núñez. Especialistas en Pavlovas y Macarrons. Visítanos en 11 de Septiembre de 1888 2451 o pide por WhatsApp.",
  
  // Imagen para compartir en redes sociales (OpenGraph)
  openGraph: {
    images: ['/images/local.jpg'], // Mostramos la vitrina al compartir el enlace
    title: "Tyta Patisserie - Excelencia y Calidad",
    description: "Patisserie boutique en Núñez, CABA.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
       </body>
    </html>
  );
}
