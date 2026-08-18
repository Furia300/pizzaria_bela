import { describe, it, expect } from "vitest";
import { PriceCalculator } from "../src/services/PriceCalculator";

describe("PriceCalculator Service", () => {
  it("should calculate single flavor pizza base price correctly", () => {
    const price = PriceCalculator.calculatePizzaPrice({
      firstFlavorPrice: 50.0,
      variantMultiplier: 1.0,
      crustPrice: 0,
      extraToppingsPrice: 0
    });
    expect(price).toBe(50.0);
  });

  it("should calculate half-and-half pizza choosing the higher flavor price", () => {
    const price = PriceCalculator.calculatePizzaPrice({
      isHalfHalf: true,
      firstFlavorPrice: 50.0, // Margherita
      secondFlavorPrice: 70.0, // Trufada (higher)
      variantMultiplier: 1.0,
      crustPrice: 0,
      extraToppingsPrice: 0
    });
    expect(price).toBe(70.0);
  });

  it("should apply variant multiplier correctly for larger sizes", () => {
    const price = PriceCalculator.calculatePizzaPrice({
      firstFlavorPrice: 60.0,
      variantMultiplier: 1.3, // Grande
      crustPrice: 10.0, // Catupiry crust
      extraToppingsPrice: 5.0
    });
    // 60 * 1.3 = 78 + 10 + 5 = 93.0
    expect(price).toBe(93.0);
  });

  it("should calculate delivery fee properly based on distance", () => {
    // Under 3km -> Base R$ 6.00
    expect(PriceCalculator.calculateDeliveryFee(2.5)).toBe(6.0);
    expect(PriceCalculator.calculateDeliveryFee(3.0)).toBe(6.0);

    // 5km -> 6.0 + (2 * 2.50) = 11.0
    expect(PriceCalculator.calculateDeliveryFee(5.0)).toBe(11.0);

    // 7.4km -> 6.0 + (4.4 * 2.50) = 6.0 + 11.0 = 17.0
    expect(PriceCalculator.calculateDeliveryFee(7.4)).toBe(17.0);

    // Out of delivery range (> 20km)
    expect(() => PriceCalculator.calculateDeliveryFee(25)).toThrowError(
      "Distância fora da área de entrega"
    );
  });

  it("should validate and apply coupons correctly", () => {
    const percentCoupon = {
      code: "PROMO10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 50.0,
      isActive: true,
      expiresAt: null
    };

    // Subtotal below minimum order
    const belowMin = PriceCalculator.applyCoupon(percentCoupon, 40.0);
    expect(belowMin.valid).toBe(false);
    expect(belowMin.discountAmount).toBe(0);

    // Valid subtotal
    const validResult = PriceCalculator.applyCoupon(percentCoupon, 100.0);
    expect(validResult.valid).toBe(true);
    expect(validResult.discountAmount).toBe(10.0);

    // Fixed discount coupon
    const fixedCoupon = {
      code: "DESC15",
      discountType: "FIXED",
      discountValue: 15.0,
      minOrderValue: 60.0,
      isActive: true,
      expiresAt: null
    };
    const fixedResult = PriceCalculator.applyCoupon(fixedCoupon, 80.0);
    expect(fixedResult.valid).toBe(true);
    expect(fixedResult.discountAmount).toBe(15.0);
  });
});
