export const STORE = {
  name: "Forno d'Oro",
  tagline: "Pizzaria artesanal · massa de fermentação natural 48h",
  phone: "(11) 4004-8920",
  whatsapp: "5511940048920",
  address: "Rua das Oliveiras, 412 — Vila Madalena, São Paulo",
  email: "ciao@fornodoro.com.br",
  deliveryFeeCents: 890,
  freeDeliveryFromCents: 12000,
  minOrderCents: 2500,
  etaMinutes: 45,
  hours: [
    { day: "Segunda a Quinta", time: "18h00 — 23h30" },
    { day: "Sexta e Sábado", time: "18h00 — 00h30" },
    { day: "Domingo", time: "18h00 — 23h00" },
  ],
} as const;

export type OrderStatus =
  | "received"
  | "preparing"
  | "oven"
  | "delivering"
  | "completed"
  | "cancelled";

export const STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "oven",
  "delivering",
  "completed",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Pedido recebido",
  preparing: "Na bancada",
  oven: "No forno a lenha",
  delivering: "Saiu para entrega",
  completed: "Entregue",
  cancelled: "Cancelado",
};

export const STATUS_HINT: Record<OrderStatus, string> = {
  received: "Confirmamos o pagamento e o seu pedido entrou na fila.",
  preparing: "Nosso pizzaiolo está abrindo a massa e montando a sua pizza.",
  oven: "Assando a 400 °C no forno a lenha por 90 segundos.",
  delivering: "O entregador saiu com o seu pedido. Acompanhe em tempo real.",
  completed: "Pedido entregue. Buon appetito!",
  cancelled: "Este pedido foi cancelado. Fale com a gente se precisar de ajuda.",
};

export const PAYMENT_LABEL: Record<string, string> = {
  pix: "PIX",
  card: "Cartão na entrega",
  cash: "Dinheiro",
};

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Sempre no fuso da pizzaria: servidor e navegador geram o mesmo texto. */
export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
