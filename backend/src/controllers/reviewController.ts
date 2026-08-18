import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AuthRequest } from "../middlewares/authMiddleware";

const reviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

export class ReviewController {
  static async createReview(req: AuthRequest, res: Response, prisma: PrismaClient) {
    const data = reviewSchema.parse(req.body);
    const userId = req.user?.id || null;

    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { review: true }
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (order.review) {
      return res.status(400).json({ error: "Este pedido já foi avaliado anteriormente." });
    }

    const review = await prisma.review.create({
      data: {
        orderId: data.orderId,
        userId,
        rating: data.rating,
        comment: data.comment || null
      }
    });

    return res.status(201).json({
      message: "Avaliação registrada com sucesso! Obrigado por sua opinião.",
      review
    });
  }

  static async getReviews(req: Request, res: Response, prisma: PrismaClient) {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true } },
        order: { select: { orderNumber: true } }
      }
    });

    return res.json({ reviews });
  }
}
