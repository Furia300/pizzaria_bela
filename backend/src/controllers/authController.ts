import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { AuthRequest } from "../middlewares/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "bellanotte_super_secret_jwt_key_2026";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "KITCHEN", "COURIER", "ADMIN"]).optional().default("CLIENT")
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória")
});

export class AuthController {
  static async register(req: Request, res: Response, prisma: PrismaClient) {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: data.role
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Usuário registrado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points
      },
      token
    });
  }

  static async login(req: Request, res: Response, prisma: PrismaClient) {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas. E-mail ou senha incorretos." });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciais inválidas. E-mail ou senha incorretos." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points
      },
      token
    });
  }

  static async me(req: AuthRequest, res: Response, prisma: PrismaClient) {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        points: true,
        addresses: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json({ user });
  }

  static async quickDemoLogin(req: Request, res: Response, prisma: PrismaClient) {
    const { role } = req.body;
    const targetRole = role || "CLIENT";

    const user = await prisma.user.findFirst({
      where: { role: targetRole }
    });

    if (!user) {
      return res.status(404).json({ error: `Usuário de demonstração para papel ${targetRole} não encontrado.` });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: `Conectado como perfil de demonstração (${targetRole})!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points
      },
      token
    });
  }
}
