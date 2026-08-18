import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { SocketHandler } from "./sockets/socketHandler";
import { createApiRoutes } from "./routes/apiRoutes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Middlewares
app.use(
  cors({
    origin: "*", // allow local dev clients
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);
app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const socketHandler = new SocketHandler(io, prisma);

// API Routes
app.use("/api", createApiRoutes(prisma, socketHandler));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "Pizzeria Bella Notte / Insta Livre Pizza API",
    time: new Date().toISOString()
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🍕 PIZZERIA BELLA NOTTE - SERVIDOR INICIADO COM SUCESSO!`);
  console.log(`🌐 HTTP API: http://localhost:${PORT}/api`);
  console.log(`⚡ WebSocket Server: ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});

export { app, server, prisma, io };
