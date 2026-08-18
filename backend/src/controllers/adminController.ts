import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AnalyticsService } from "../services/AnalyticsService";

export class AdminController {
  static async getDashboard(req: Request, res: Response, prisma: PrismaClient) {
    const metrics = await AnalyticsService.getDashboardMetrics(prisma);
    return res.json({ metrics });
  }

  static async getAllOrders(req: Request, res: Response, prisma: PrismaClient) {
    const { status, limit = 50 } = req.query;

    const orders = await prisma.order.findMany({
      where: status ? { status: String(status) } : undefined,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        courier: {
          select: { id: true, name: true, phone: true }
        },
        statusHistory: true,
        review: true
      }
    });

    return res.json({ orders });
  }

  static async getCouriers(req: Request, res: Response, prisma: PrismaClient) {
    const couriers = await prisma.user.findMany({
      where: { role: "COURIER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        deliveries: {
          where: { status: { in: ["READY", "OUT_FOR_DELIVERY"] } },
          select: { id: true, orderNumber: true, status: true }
        }
      }
    });

    return res.json({ couriers });
  }
}
