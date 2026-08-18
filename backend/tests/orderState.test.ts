import { describe, it, expect } from "vitest";
import { OrderStateService } from "../src/services/OrderStateService";

describe("OrderStateService State Machine", () => {
  it("should permit standard happy-path order progression", () => {
    expect(OrderStateService.validateTransition("RECEIVED", "PREPARING").valid).toBe(true);
    expect(OrderStateService.validateTransition("PREPARING", "BAKING").valid).toBe(true);
    expect(OrderStateService.validateTransition("BAKING", "READY").valid).toBe(true);
    expect(OrderStateService.validateTransition("READY", "OUT_FOR_DELIVERY").valid).toBe(true);
    expect(OrderStateService.validateTransition("OUT_FOR_DELIVERY", "DELIVERED").valid).toBe(true);
  });

  it("should permit order cancellation only in early stages", () => {
    expect(OrderStateService.validateTransition("RECEIVED", "CANCELED").valid).toBe(true);
    expect(OrderStateService.validateTransition("PREPARING", "CANCELED").valid).toBe(true);
    // Cannot cancel after pizza is in the oven / baked / out for delivery
    expect(OrderStateService.validateTransition("BAKING", "CANCELED").valid).toBe(false);
    expect(OrderStateService.validateTransition("READY", "CANCELED").valid).toBe(false);
    expect(OrderStateService.validateTransition("OUT_FOR_DELIVERY", "CANCELED").valid).toBe(false);
  });

  it("should reject illegal jumping transitions", () => {
    // Jump from RECEIVED straight to DELIVERED
    const jumpResult = OrderStateService.validateTransition("RECEIVED", "DELIVERED");
    expect(jumpResult.valid).toBe(false);
    expect(jumpResult.error).toBeDefined();

    // Revert from DELIVERED back to PREPARING
    const revertResult = OrderStateService.validateTransition("DELIVERED", "PREPARING");
    expect(revertResult.valid).toBe(false);
  });

  it("should return human-readable labels and descriptions in Portuguese", () => {
    expect(OrderStateService.getStatusLabel("BAKING")).toBe("No Forno a Lenha");
    expect(OrderStateService.getStatusDescription("OUT_FOR_DELIVERY")).toContain("motoboy");
  });
});
