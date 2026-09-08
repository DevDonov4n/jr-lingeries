"use client";

import {
  createContext,
  useContext,
  useEffect,
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
  isHydrated: boolean;

  addToCart: (
    product: Product,
    selectedSize: string,
    quantity: number
  ) => void;

  removeFromCart: (
    productId: number,
    selectedSize: string
  ) => void;

  updateQuantity: (
    productId: number,
    selectedSize: string,
    quantity: number
  ) => void;

  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCartItem(item: CartItem): CartItem {
  const originalPrice = item.originalPrice ?? item.price;
  const discountAmount = item.discountAmount ?? 0;

  return {
    ...item,
    originalPrice,
    discountAmount,
    discountPercent: item.discountPercent ?? (originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("jr-lingeries-cart");

    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        setCart(parsedCart.map(normalizeCartItem));
      } catch {
        console.error("Não foi possível carregar o carrinho.");
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("jr-lingeries-cart", JSON.stringify(cart));
  }, [cart, isHydrated]);

  function addToCart(product: Product, selectedSize: string, quantity: number) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize
            ? {
                ...item,
                ...product,
                quantity: Math.min(item.quantity + quantity, product.stock),
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: Math.min(quantity, product.stock),
          selectedSize,
        },
      ];
    });
  }

  function removeFromCart(productId: number, selectedSize: string) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => !(item.id === productId && item.selectedSize === selectedSize)
      )
    );
  }

  function updateQuantity(productId: number, selectedSize: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{ cart, isHydrated, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser utilizado dentro de CartProvider");
  }

  return context;
}
