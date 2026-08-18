import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error Handler] ${req.method} ${req.url} - Error:`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Erro de validação dos dados enviados.",
      details: err.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
    });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message || "Erro na requisição." });
  }

  return res.status(500).json({
    error: "Erro interno no servidor. Por favor, tente novamente em instantes.",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};
