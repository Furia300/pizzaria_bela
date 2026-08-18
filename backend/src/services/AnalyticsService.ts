import { PrismaClient } from "@prisma/client";

export class AnalyticsService {
  static async getDashboardMetrics(prisma: PrismaClient) {
    // Total orders and revenue
    const allOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        statusHistory: true,
        review: true
      },
      orderBy: { createdAt: "desc" }
    });

    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter((o) => o.status === "DELIVERED");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Status breakdown
    const statusCounts: Record<string, number> = {
      RECEIVED: 0,
      PREPARING: 0,
      BAKING: 0,
      READY: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELED: 0
    };

    allOrders.forEach((order) => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });

    // Top selling products calculation
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; image: string }> = {};

    allOrders.forEach((order) => {
      if (order.status !== "CANCELED") {
        order.items.forEach((item) => {
          const prodName = item.product?.name || "Pizza Personalizada";
          const prodImage = item.product?.image || "/hero-pizza.jpg";
          if (!productSalesMap[prodName]) {
            productSalesMap[prodName] = { name: prodName, quantity: 0, revenue: 0, image: prodImage };
          }
          productSalesMap[prodName].quantity += item.quantity;
          productSalesMap[prodName].revenue += item.totalPrice;
        });
      }
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate Average Delivery Time (in minutes)
    let totalDeliveryMinutes = 0;
    let deliveredOrdersWithHistory = 0;

    completedOrders.forEach((order) => {
      const createdTime = new Date(order.createdAt).getTime();
      const deliveredHistory = order.statusHistory.find((h) => h.status === "DELIVERED");
      if (deliveredHistory) {
        const deliveredTime = new Date(deliveredHistory.createdAt).getTime();
        const diffMinutes = Math.max(1, Math.round((deliveredTime - createdTime) / (1000 * 60)));
        totalDeliveryMinutes += diffMinutes;
        deliveredOrdersWithHistory++;
      }
    });

    const averageDeliveryTimeMinutes =
      deliveredOrdersWithHistory > 0 ? Math.round(totalDeliveryMinutes / deliveredOrdersWithHistory) : 32;

    // Reviews & Customer Satisfaction
    const allReviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        order: { select: { orderNumber: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    const totalRatings = allReviews.length;
    const averageRating =
      totalRatings > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 4.9;

    // Hourly / Daily sales history for charts
    const recentOrders = allOrders.slice(0, 10).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      clientName: o.guestName || o.userId || "Cliente",
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt
    }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      completedOrdersCount: completedOrders.length,
      averageTicket: Math.round(averageTicket * 100) / 100,
      averageDeliveryTimeMinutes,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatingsCount: totalRatings,
      statusCounts,
      topProducts,
      recentOrders,
      recentReviews: allReviews
    };
  }
}
