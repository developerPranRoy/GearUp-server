import { z } from "zod";

const createGearZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    description: z.string().optional(),
    brand: z.string().optional(),
    pricePerDay: z.number({ required_error: "Price per day is required" }),
    totalStock: z.number({ required_error: "Total stock is required" }),
    images: z.array(z.string()).optional(),
    categoryId: z.string({ required_error: "Category is required" }),
  }),
});

const updateGearZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    pricePerDay: z.number().optional(),
    totalStock: z.number().optional(),
    availableStock: z.number().optional(),
    images: z.array(z.string()).optional(),
    categoryId: z.string().optional(),
    status: z.enum(["AVAILABLE", "UNAVAILABLE"]).optional(),
  }),
});

export const GearValidation = {
  createGearZodSchema,
  updateGearZodSchema,
};
