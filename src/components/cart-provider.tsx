"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";
import { makeCartItemKey } from "@/lib/types";

const STORAGE_KEY = "fornodoro:cart:v1";

type NewItem = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  addItem: (item: NewItem) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  hydrated: boolean;
  bump: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item) => item && typeof item.productId === "number"));
        }
      }
    } catch {
      /* carrinho corrompido: começa vazio */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignora quota cheia */
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const addItem = useCallback((item: NewItem) => {
    const key = makeCartItemKey(
      item.productId,
      item.sizeId,
      item.addons.map((addon) => addon.id),
      item.notes,
    );
    const quantity = Math.max(1, Math.min(20, item.quantity ?? 1));
    setItems((current) => {
      const existing = current.find((entry) => entry.key === key);
      if (existing) {
        return current.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: Math.min(20, entry.quantity + quantity) }
            : entry,
        );
      }
      return [...current, { ...item, key, quantity }];
    });
    setBump((value) => value + 1);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) =>
            item.key === key ? { ...item, quantity: Math.min(20, quantity) } : item,
          ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotalCents = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      setQuantity,
      removeItem,
      clear,
      count,
      subtotalCents,
      isOpen,
      openCart,
      closeCart,
      hydrated,
      bump,
    }),
    [
      items,
      addItem,
      setQuantity,
      removeItem,
      clear,
      count,
      subtotalCents,
      isOpen,
      openCart,
      closeCart,
      hydrated,
      bump,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return context;
}
