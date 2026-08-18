import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export class ProductController {
  static async getCategoriesWithProducts(req: Request, res: Response, prisma: PrismaClient) {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            variants: true
          }
        }
      }
    });

    return res.json({ categories });
  }

  static async getProductBySlug(req: Request, res: Response, prisma: PrismaClient) {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    return res.json({ product });
  }

  static async getCustomizerIngredients(req: Request, res: Response, prisma: PrismaClient) {
    const ingredients = await prisma.ingredient.findMany({
      where: { isAvailable: true },
      orderBy: { name: "asc" }
    });

    // Group by category
    const grouped = {
      BASE: ingredients.filter((i) => i.category === "BASE"),
      SAUCE: ingredients.filter((i) => i.category === "SAUCE"),
      CHEESE: ingredients.filter((i) => i.category === "CHEESE"),
      PROTEIN: ingredients.filter((i) => i.category === "PROTEIN"),
      VEGGIE: ingredients.filter((i) => i.category === "VEGGIE"),
      CRUST: ingredients.filter((i) => i.category === "CRUST"),
      FINISH: ingredients.filter((i) => i.category === "FINISH")
    };

    const pizzasForHalfHalf = await prisma.product.findMany({
      where: {
        isAvailable: true,
        category: { slug: { in: ["tradicionais", "especiais", "doces"] } }
      },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        image: true,
        isVegetarian: true,
        isSpicy: true
      }
    });

    return res.json({
      ingredients,
      grouped,
      pizzasForHalfHalf
    });
  }

  static async createProduct(req: Request, res: Response, prisma: PrismaClient) {
    const schema = z.object({
      categoryId: z.string(),
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string(),
      basePrice: z.number().positive(),
      image: z.string().url().or(z.string()),
      isCustomizable: z.boolean().default(true),
      isVegetarian: z.boolean().default(false),
      isSpicy: z.boolean().default(false),
      isChefSpecial: z.boolean().default(false),
      ingredients: z.string().optional(),
      variants: z.array(
        z.object({
          name: z.string(),
          sizeSlices: z.number().default(8),
          priceMultiplier: z.number().default(1.0),
          isDefault: z.boolean().default(false)
        })
      ).optional()
    });

    const data = schema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        image: data.image,
        isCustomizable: data.isCustomizable,
        isVegetarian: data.isVegetarian,
        isSpicy: data.isSpicy,
        isChefSpecial: data.isChefSpecial,
        ingredients: data.ingredients,
        variants: data.variants ? { create: data.variants } : undefined
      },
      include: {
        variants: true
      }
    });

    return res.status(201).json({ product, message: "Produto criado com sucesso!" });
  }

  static async updateProduct(req: Request, res: Response, prisma: PrismaClient) {
    const { id } = req.params;
    const body = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        basePrice: body.basePrice,
        image: body.image,
        isAvailable: body.isAvailable,
        isVegetarian: body.isVegetarian,
        isSpicy: body.isSpicy,
        isChefSpecial: body.isChefSpecial
      }
    });

    return res.json({ product, message: "Produto atualizado com sucesso!" });
  }

  static async deleteProduct(req: Request, res: Response, prisma: PrismaClient) {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return res.json({ message: "Produto removido com sucesso!" });
  }
}
