import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { SocketHandler } from "../sockets/socketHandler";
import { AuthController } from "../controllers/authController";
import { ProductController } from "../controllers/productController";
import { OrderController } from "../controllers/orderController";
import { CourierController } from "../controllers/courierController";
import { AdminController } from "../controllers/adminController";
import { ReviewController } from "../controllers/reviewController";
import { authenticateToken, requireRole, optionalAuth } from "../middlewares/authMiddleware";

export const createApiRoutes = (prisma: PrismaClient, socketHandler: SocketHandler): Router => {
  const router = Router();

  // --- AUTH ROUTES ---
  router.post("/auth/register", (req, res) => AuthController.register(req, res, prisma));
  router.post("/auth/login", (req, res) => AuthController.login(req, res, prisma));
  router.get("/auth/me", authenticateToken, (req, res) => AuthController.me(req, res, prisma));
  router.post("/auth/demo-login", (req, res) => AuthController.quickDemoLogin(req, res, prisma));

  // --- PRODUCTS & MENU ROUTES ---
  router.get("/menu", (req, res) => ProductController.getCategoriesWithProducts(req, res, prisma));
  router.get("/products/:slug", (req, res) => ProductController.getProductBySlug(req, res, prisma));
  router.get("/customizer/ingredients", (req, res) =>
    ProductController.getCustomizerIngredients(req, res, prisma)
  );

  // --- ORDER ROUTES ---
  router.post("/orders", optionalAuth, (req, res) =>
    OrderController.createOrder(req, res, prisma, socketHandler)
  );
  router.get("/orders/:identifier", (req, res) =>
    OrderController.getOrderByIdOrNumber(req, res, prisma)
  );
  router.patch("/orders/:id/status", optionalAuth, (req, res) =>
    OrderController.updateOrderStatus(req, res, prisma, socketHandler)
  );
  router.post("/orders/validate-coupon", (req, res) =>
    OrderController.validateCoupon(req, res, prisma)
  );
  router.post("/orders/estimate-delivery", (req, res) =>
    OrderController.estimateDelivery(req, res)
  );
  router.post("/orders/:orderId/confirm-pix", (req, res) =>
    OrderController.confirmPixPayment(req, res, prisma, socketHandler)
  );

  // --- KITCHEN DISPLAY SYSTEM (KDS) ---
  router.get("/kds/orders", (req, res) => OrderController.getKdsOrders(req, res, prisma));

  // --- COURIER ROUTES ---
  router.get("/courier/deliveries", optionalAuth, (req, res) =>
    CourierController.getAssignedDeliveries(req, res, prisma)
  );
  router.post("/courier/location", (req, res) =>
    CourierController.updateLocation(req, res, prisma, socketHandler)
  );
  router.post("/courier/orders/:orderId/complete", (req, res) =>
    CourierController.completeDelivery(req, res, prisma, socketHandler)
  );

  // --- ADMIN ROUTES ---
  router.get("/admin/dashboard", (req, res) => AdminController.getDashboard(req, res, prisma));
  router.get("/admin/orders", (req, res) => AdminController.getAllOrders(req, res, prisma));
  router.get("/admin/couriers", (req, res) => AdminController.getCouriers(req, res, prisma));
  router.post("/admin/products", authenticateToken, requireRole(["ADMIN"]), (req, res) =>
    ProductController.createProduct(req, res, prisma)
  );
  router.put("/admin/products/:id", authenticateToken, requireRole(["ADMIN"]), (req, res) =>
    ProductController.updateProduct(req, res, prisma)
  );
  router.delete("/admin/products/:id", authenticateToken, requireRole(["ADMIN"]), (req, res) =>
    ProductController.deleteProduct(req, res, prisma)
  );

  // --- REVIEWS ---
  router.post("/reviews", optionalAuth, (req, res) =>
    ReviewController.createReview(req, res, prisma)
  );
  router.get("/reviews", (req, res) => ReviewController.getReviews(req, res, prisma));

  return router;
};
