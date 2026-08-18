import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AuthRequest } from "../middlewares/authMiddleware";
import { PriceCalculator } from "../services/PriceCalculator";
import { OrderStateService, OrderStatus } from "../services/OrderStateService";
import { PaymentService } from "../services/PaymentService";
import { SocketHandler } from "../sockets/socketHandler";

const orderItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().positive(),
  customConfig: z
    .object({
      isHalfHalf: z.boolean().optional(),
      firstFlavorName: z.string().optional(),
      secondFlavorName: z.string().optional(),
      firstFlavorPrice: z.number().optional(),
      secondFlavorPrice: z.number().optional(),
      doughType: z.string().optional(),
      crustType: z.string().optional(),
      crustPrice: z.number().optional(),
      addedToppings: z.array(z.string()).optional(),
      removedToppings: z.array(z.string()).optional(),
      variantName: z.string().optional()
    })
    .optional(),
  notes: z.string().optional()
});

const createOrderSchema = z.object({
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  guestEmail: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "O carrinho deve ter pelo menos um item"),
  deliveryAddress: z.object({
    street: z.string().min(2),
    number: z.string().min(1),
    complement: z.string().optional(),
    neighborhood: z.string().min(2),
    city: z.string().min(2),
    state: z.string().default("SP"),
    zipCode: z.string().min(8),
    lat: z.number().optional(),
    lng: z.number().optional()
  }),
  deliveryFee: z.number().default(0),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "CASH"]),
  cardData: z
    .object({
      cardNumber: z.string(),
      cardHolder: z.string(),
      expiryDate: z.string(),
      cvv: z.string(),
      installments: z.number().optional()
    })
    .optional(),
  notes: z.string().optional()
});

export class OrderController {
  static async createOrder(
    req: AuthRequest,
    res: Response,
    prisma: PrismaClient,
    socketHandler: SocketHandler
  ) {
    const data = createOrderSchema.parse(req.body);
    const userId = req.user?.id || null;

    // Calculate subtotal from items
    let subtotal = 0;
    const itemsToCreate: any[] = [];

    for (const item of data.items) {
      let itemPrice = item.unitPrice;

      if (item.customConfig) {
        itemPrice = PriceCalculator.calculatePizzaPrice({
          isHalfHalf: item.customConfig.isHalfHalf,
          firstFlavorPrice: item.customConfig.firstFlavorPrice,
          secondFlavorPrice: item.customConfig.secondFlavorPrice,
          crustPrice: item.customConfig.crustPrice,
          variantMultiplier: 1.0 // Already factored into flavor prices
        });
      }

      const totalItemPrice = itemPrice * item.quantity;
      subtotal += totalItemPrice;

      itemsToCreate.push({
        productId: item.productId || null,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice: itemPrice,
        totalPrice: totalItemPrice,
        customConfig: item.customConfig ? JSON.stringify(item.customConfig) : null,
        notes: item.notes || null
      });
    }

    // Process coupon if provided
    let discountAmount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() }
      });
      const couponResult = PriceCalculator.applyCoupon(coupon, subtotal);
      if (couponResult.valid) {
        discountAmount = couponResult.discountAmount;
        if (coupon) {
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
        }
      }
    }

    const { totalAmount } = PriceCalculator.calculateOrderSummary(
      subtotal,
      data.deliveryFee,
      discountAmount
    );

    // Generate unique sequential order number
    const count = await prisma.order.count();
    const orderNumber = 1000 + count + 1;

    // Process Payment
    let paymentStatus = "PENDING";
    let paymentDetails: any = null;

    if (data.paymentMethod === "PIX") {
      paymentDetails = PaymentService.generatePix(totalAmount, orderNumber);
      paymentStatus = "PENDING";
    } else if (data.paymentMethod === "CREDIT_CARD") {
      if (!data.cardData) {
        return res.status(400).json({ error: "Dados do cartão de crédito são obrigatórios." });
      }
      const cardResult = PaymentService.validateAndProcessCard(data.cardData, totalAmount);
      if (!cardResult.success) {
        return res.status(400).json({ error: cardResult.message });
      }
      paymentStatus = "PAID";
      paymentDetails = cardResult.details;
    } else {
      paymentStatus = "PENDING";
      paymentDetails = { type: "CASH_ON_DELIVERY" };
    }

    // Create Order with Items in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestName: data.guestName || (req.user ? req.user.name : "Cliente Convidado"),
        guestPhone: data.guestPhone || "",
        guestEmail: data.guestEmail || (req.user ? req.user.email : ""),
        status: "RECEIVED",
        subtotal,
        deliveryFee: data.deliveryFee,
        discountAmount,
        totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus,
        paymentDetails: JSON.stringify(paymentDetails),
        deliveryAddress: JSON.stringify(data.deliveryAddress),
        notes: data.notes || null,
        estimatedTime: 35 + Math.round(data.deliveryFee),
        items: {
          create: itemsToCreate
        },
        statusHistory: {
          create: {
            status: "RECEIVED",
            note: "Pedido realizado com sucesso.",
            changedBy: "CLIENT_CHECKOUT"
          }
        }
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        statusHistory: true
      }
    });

    // Award loyalty points to logged in user
    if (userId) {
      const earnedPoints = Math.floor(totalAmount);
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: earnedPoints } }
      });
    }

    // Broadcast new order to Kitchen Display System (KDS)
    socketHandler.broadcastNewOrder(order);

    return res.status(201).json({
      message: "Pedido criado com sucesso!",
      order,
      payment: paymentDetails
    });
  }

  static async getOrderByIdOrNumber(req: Request, res: Response, prisma: PrismaClient) {
    const { identifier } = req.params;

    const isNumeric = /^\d+$/.test(identifier);

    const order = await prisma.order.findFirst({
      where: isNumeric ? { orderNumber: parseInt(identifier, 10) } : { id: identifier },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: "asc" }
        },
        courier: {
          select: { id: true, name: true, phone: true }
        },
        deliveryTrack: true,
        review: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    return res.json({ order });
  }

  static async updateOrderStatus(
    req: AuthRequest,
    res: Response,
    prisma: PrismaClient,
    socketHandler: SocketHandler
  ) {
    const { id } = req.params;
    const { status, note, courierId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { statusHistory: true }
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    const transitionCheck = OrderStateService.validateTransition(
      order.status as OrderStatus,
      status as OrderStatus
    );

    if (!transitionCheck.valid) {
      return res.status(400).json({ error: transitionCheck.error });
    }

    const updateData: any = {
      status,
      statusHistory: {
        create: {
          status,
          note: note || OrderStateService.getStatusDescription(status as OrderStatus),
          changedBy: req.user ? `${req.user.name} (${req.user.role})` : "SISTEMA"
        }
      }
    };

    if (courierId) {
      updateData.courierId = courierId;
    }

    if (status === "DELIVERED") {
      updateData.paymentStatus = "PAID";
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: "asc" }
        },
        courier: {
          select: { id: true, name: true, phone: true }
        },
        deliveryTrack: true
      }
    });

    // Broadcast update via WebSockets
    socketHandler.broadcastStatusUpdate(id, status, updatedOrder);

    return res.json({
      message: `Status atualizado para ${OrderStateService.getStatusLabel(status as OrderStatus)}`,
      order: updatedOrder
    });
  }

  static async validateCoupon(req: Request, res: Response, prisma: PrismaClient) {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Código de cupom obrigatório." });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    const result = PriceCalculator.applyCoupon(coupon, subtotal || 0);
    return res.json(result);
  }

  static async estimateDelivery(req: Request, res: Response) {
    const { zipCode, distanceKm } = req.body;
    let distance = distanceKm;

    if (!distance) {
      // Deterministic distance calculation based on zip code hash (2 to 8 km)
      const cleanZip = (zipCode || "01310900").replace(/\D/g, "");
      const num = parseInt(cleanZip.slice(-3) || "300", 10);
      distance = 2.0 + (num % 6) * 1.1;
    }

    const fee = PriceCalculator.calculateDeliveryFee(distance);
    return res.json({
      distanceKm: Math.round(distance * 10) / 10,
      deliveryFee: fee,
      estimatedTimeMinutes: 30 + Math.round(distance * 3)
    });
  }

  static async confirmPixPayment(
    req: Request,
    res: Response,
    prisma: PrismaClient,
    socketHandler: SocketHandler
  ) {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentDetails: JSON.stringify({
          ...(order.paymentDetails ? JSON.parse(order.paymentDetails) : {}),
          paidAt: new Date().toISOString(),
          status: "PAID_CONFIRMED"
        })
      },
      include: {
        items: { include: { product: true } },
        statusHistory: true,
        courier: true
      }
    });

    socketHandler.broadcastStatusUpdate(orderId, order.status, updated);

    return res.json({
      message: "Pagamento PIX confirmado com sucesso!",
      order: updated
    });
  }

  static async getKdsOrders(req: Request, res: Response, prisma: PrismaClient) {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["RECEIVED", "PREPARING", "BAKING", "READY"] }
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: "asc" }
        },
        courier: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    const couriers = await prisma.user.findMany({
      where: { role: "COURIER" },
      select: { id: true, name: true, phone: true }
    });

    return res.json({ orders, couriers });
  }
}
