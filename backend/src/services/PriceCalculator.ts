export interface CustomPizzaConfig {
  isHalfHalf?: boolean;
  firstFlavorPrice?: number;
  secondFlavorPrice?: number;
  crustPrice?: number;
  extraToppingsPrice?: number;
  variantMultiplier?: number;
}

export interface CouponValidation {
  valid: boolean;
  discountAmount: number;
  message?: string;
}

export class PriceCalculator {
  /**
   * Calculates unit price for a pizza item
   * Rules:
   * 1. If half-and-half, base price is the higher price between the two flavors
   * 2. Price is multiplied by variant multiplier (e.g., M=1.0, G=1.35, Família=1.65)
   * 3. Add crust extra price and extra toppings price
   */
  static calculatePizzaPrice(config: CustomPizzaConfig): number {
    const variantMultiplier = config.variantMultiplier ?? 1.0;
    let baseFlavorPrice = 0;

    if (config.isHalfHalf && config.firstFlavorPrice !== undefined && config.secondFlavorPrice !== undefined) {
      baseFlavorPrice = Math.max(config.firstFlavorPrice, config.secondFlavorPrice);
    } else {
      baseFlavorPrice = config.firstFlavorPrice || 0;
    }

    const calculatedBase = baseFlavorPrice * variantMultiplier;
    const crust = config.crustPrice || 0;
    const extraToppings = config.extraToppingsPrice || 0;

    const total = calculatedBase + crust + extraToppings;
    return Math.round(total * 100) / 100;
  }

  /**
   * Calculates delivery fee based on estimated distance in km
   * Base fee: R$ 6.00 (up to 3km)
   * Additional: R$ 2.50 per km above 3km
   * Maximum allowed delivery distance: 15km
   */
  static calculateDeliveryFee(distanceKm: number): number {
    if (distanceKm <= 0) return 0;
    if (distanceKm > 20) {
      throw new Error("Distância fora da área de entrega (máx 20km)");
    }
    const baseFee = 6.0;
    if (distanceKm <= 3) {
      return baseFee;
    }
    const extraKm = distanceKm - 3;
    const totalFee = baseFee + extraKm * 2.5;
    return Math.round(totalFee * 100) / 100;
  }

  /**
   * Validates and computes coupon discount
   */
  static applyCoupon(
    coupon: {
      code: string;
      discountType: string;
      discountValue: number;
      minOrderValue: number;
      isActive: boolean;
      expiresAt: Date | null;
    } | null,
    subtotal: number
  ): CouponValidation {
    if (!coupon) {
      return { valid: false, discountAmount: 0, message: "Cupom não encontrado" };
    }

    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, message: "Este cupom foi desativado" };
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return { valid: false, discountAmount: 0, message: "Este cupom expirou" };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Valor mínimo para este cupom é R$ ${coupon.minOrderValue.toFixed(2)}`
      };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      discountAmount: Math.round(discount * 100) / 100,
      message: "Cupom aplicado com sucesso!"
    };
  }

  /**
   * Calculates full order summary
   */
  static calculateOrderSummary(subtotal: number, deliveryFee: number, discountAmount: number) {
    const total = Math.max(0, subtotal + deliveryFee - discountAmount);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalAmount: Math.round(total * 100) / 100
    };
  }
}
