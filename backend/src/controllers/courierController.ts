import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";
import { SocketHandler } from "../sockets/socketHandler";
import { OrderStateService } from "../services/OrderStateService";

export class CourierController {
  static async getAssignedDeliveries(req: AuthRequest, res: Response, prisma: PrismaClient) {
    const courierId = req.user?.id;

    const activeOrders = await prisma.order.findMany({
      where: {
        courierId: courierId || undefined,
        status: { in: ["READY", "OUT_FOR_DELIVERY"] }
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        deliveryTrack: true
      },
      orderBy: { createdAt: "desc" }
    });

    const completedOrders = await prisma.order.findMany({
      where: {
        courierId: courierId || undefined,
        status: "DELIVERED"
      },
      take: 10,
      orderBy: { updatedAt: "desc" }
    });

    return res.json({
      activeOrders,
      completedOrders
    });
  }

  static async updateLocation(
    req: Request,
    res: Response,
    prisma: PrismaClient,
    socketHandler: SocketHandler
  ) {
    const { orderId, courierId, lat, lng, speed, heading } = req.body;

    if (!orderId || !lat || !lng) {
      return res.status(400).json({ error: "Parâmetros de localização incompletos." });
    }

    const tracking = await prisma.deliveryTracking.upsert({
      where: { orderId },
      update: {
        currentLat: lat,
        currentLng: lng,
        speed: speed || 0,
        heading: heading || 0,
        status: "ACTIVE"
      },
      create: {
        orderId,
        courierId: courierId || "default_courier",
        currentLat: lat,
        currentLng: lng,
        speed: speed || 0,
        heading: heading || 0,
        status: "ACTIVE"
      }
    });

    // Notify the room via WebSockets
    socketHandler.broadcastStatusUpdate(orderId, "OUT_FOR_DELIVERY", {
      id: orderId,
      deliveryTrack: tracking
    });

    return res.json({ tracking, success: true });
  }

  static async completeDelivery(
    req: Request,
    res: Response,
    prisma: PrismaClient,
    socketHandler: SocketHandler
  ) {
    const { orderId } = req.params;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        paymentStatus: "PAID",
        statusHistory: {
          create: {
            status: "DELIVERED",
            note: "Pedido entregue ao cliente pelo motoboy.",
            changedBy: "COURIER_APP"
          }
        },
        deliveryTrack: {
          update: {
            status: "FINISHED"
          }
        }
      },
      include: {
        items: { include: { product: true } },
        statusHistory: true,
        deliveryTrack: true
      }
    });

    socketHandler.broadcastStatusUpdate(orderId, "DELIVERED", order);

    return res.json({
      message: "Entrega finalizada com sucesso!",
      order
    });
  }
}
