import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

export class SocketHandler {
  private io: Server;
  private prisma: PrismaClient;

  constructor(io: Server, prisma: PrismaClient) {
    this.io = io;
    this.prisma = prisma;
    this.initializeEvents();
  }

  private initializeEvents() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`[Socket.IO] Novo cliente conectado: ${socket.id}`);

      // Client joins their order room
      socket.on("join_order", (orderId: string) => {
        if (!orderId) return;
        socket.join(`order:${orderId}`);
        console.log(`[Socket.IO] Cliente ${socket.id} entrou na sala do pedido: order:${orderId}`);
      });

      // Kitchen displays join the KDS room
      socket.on("join_kds", () => {
        socket.join("kds");
        console.log(`[Socket.IO] Cozinha ${socket.id} conectada ao KDS`);
      });

      // Couriers join their portal
      socket.on("join_courier", (courierId: string) => {
        if (!courierId) return;
        socket.join(`courier:${courierId}`);
        socket.join("couriers_pool");
        console.log(`[Socket.IO] Motoboy ${courierId} conectado`);
      });

      // Motoboy streams live GPS coordinates
      socket.on(
        "courier_location_update",
        async (data: {
          orderId: string;
          courierId: string;
          lat: number;
          lng: number;
          heading?: number;
          speed?: number;
        }) => {
          const { orderId, courierId, lat, lng, heading = 0, speed = 0 } = data;
          if (!orderId || !lat || !lng) return;

          try {
            // Update tracking in database
            await this.prisma.deliveryTracking.upsert({
              where: { orderId },
              update: {
                currentLat: lat,
                currentLng: lng,
                heading,
                speed,
                status: "ACTIVE"
              },
              create: {
                orderId,
                courierId,
                currentLat: lat,
                currentLng: lng,
                heading,
                speed,
                status: "ACTIVE"
              }
            });

            // Broadcast real-time location directly to the client watching the order
            this.io.to(`order:${orderId}`).emit("courier_location_changed", {
              orderId,
              courierId,
              lat,
              lng,
              heading,
              speed,
              updatedAt: new Date().toISOString()
            });
          } catch (err) {
            console.error(`[Socket.IO] Erro ao persistir localização do motoboy:`, err);
          }
        }
      );

      socket.on("disconnect", () => {
        console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast new order to Kitchen (KDS) and Admin
   */
  public broadcastNewOrder(order: any) {
    this.io.to("kds").emit("new_order_received", order);
    this.io.emit("admin_order_event", { type: "NEW_ORDER", order });
  }

  /**
   * Broadcast order status update to Client, KDS and Courier
   */
  public broadcastStatusUpdate(orderId: string, status: string, fullOrder: any) {
    this.io.to(`order:${orderId}`).emit("order_status_updated", {
      orderId,
      status,
      order: fullOrder,
      updatedAt: new Date().toISOString()
    });

    this.io.to("kds").emit("kds_order_status_updated", {
      orderId,
      status,
      order: fullOrder
    });

    if (fullOrder.courierId) {
      this.io.to(`courier:${fullOrder.courierId}`).emit("courier_order_updated", {
        orderId,
        status,
        order: fullOrder
      });
    }

    this.io.emit("admin_order_event", { type: "STATUS_CHANGE", orderId, status });
  }
}
