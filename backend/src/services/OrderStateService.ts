export type OrderStatus =
  | "RECEIVED"
  | "PREPARING"
  | "BAKING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

export interface StateTransitionResult {
  valid: boolean;
  from: OrderStatus;
  to: OrderStatus;
  error?: string;
}

export class OrderStateService {
  private static readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    RECEIVED: ["PREPARING", "CANCELED"],
    PREPARING: ["BAKING", "CANCELED"],
    BAKING: ["READY"],
    READY: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: [],
    CANCELED: []
  };

  /**
   * Validates if a state transition is permitted
   */
  static validateTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): StateTransitionResult {
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    if (allowed.includes(nextStatus)) {
      return { valid: true, from: currentStatus, to: nextStatus };
    }
    return {
      valid: false,
      from: currentStatus,
      to: nextStatus,
      error: `Transição inválida de "${currentStatus}" para "${nextStatus}". Transições permitidas: ${allowed.join(", ") || "Nenhuma"}`
    };
  }

  /**
   * Human-readable label in Portuguese
   */
  static getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      RECEIVED: "Pedido Recebido",
      PREPARING: "Em Preparação",
      BAKING: "No Forno a Lenha",
      READY: "Pronto para Retirada / Entrega",
      OUT_FOR_DELIVERY: "Saiu para Entrega",
      DELIVERED: "Entregue com Sucesso",
      CANCELED: "Pedido Cancelado"
    };
    return labels[status] || status;
  }

  /**
   * Returns human-readable description for timeline
   */
  static getStatusDescription(status: OrderStatus): string {
    const descriptions: Record<OrderStatus, string> = {
      RECEIVED: "Seu pedido foi confirmado e encaminhado para nossa cozinha artesanal.",
      PREPARING: "O pizzaiolo está abrindo a massa de fermentação lenta e montando seus ingredientes.",
      BAKING: "Sua pizza está assando no forno a lenha em alta temperatura com lenha de eucalipto reflorestado.",
      READY: "Pizza pronta, quentinha e embalada com lacre de segurança.",
      OUT_FOR_DELIVERY: "Nosso motoboy já coletou seu pedido e está a caminho do seu endereço!",
      DELIVERED: "Pedido entregue. Bom apetite e aproveite a verdadeira pizza italiana!",
      CANCELED: "O pedido foi cancelado."
    };
    return descriptions[status] || "";
  }
}
