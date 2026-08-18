"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { Product } from "@/data/products";

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    selectedSize: string,
    quantity: number
  ) => void;
  removeFromCart: (productId: number, selectedSize: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(
    product: Product,
    selectedSize: string,
    quantity: number
  ) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity,
          selectedSize,
        },
      ];
    });
  }

  function removeFromCart(
    productId: number,
    selectedSize: string
  ) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedSize === selectedSize
          )
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart deve ser utilizado dentro de CartProvider"
    );
  }

  return context;
}