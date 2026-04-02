"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  addToCart: (product: Product, quantity?: number) => void; // Ahora acepta cantidad
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  // --- NUEVOS ESTADOS PARA EL TOAST ---
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Estado inicial del Toast
  const [toast, setToast] = useState({ message: "", visible: false });

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => {
  setCart([]);
  showToast("Carrito vaciado 🗑️"); // Un mimo visual ya que tenemos los toasts
  closeCart();
  };

  // Función para disparar la notificación
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    // Magia: se oculta solo a los 3 segundos
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Optimizamos addToCart para que sume cantidades de una y no abra el panel
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    
    // Mostramos la notificación sutil en lugar de invadir la pantalla
    showToast(`¡${product.name} agregado a tu pedido! 🍰`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        clearCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartCount,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}