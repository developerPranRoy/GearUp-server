import { z } from "zod";

const createRentalZodSchema = z.object({
  body: z.object({
    startDate: z.string({ required_error: "Start date is required" }),
    endDate: z.string({ required_error: "End date is required" }),
    items: z
      .array(
        z.object({
          gearItemId: z.string({ required_error: "Gear item id is required" }),
          quantity: z.number({ required_error: "Quantity is required" }).min(1),
        })
      )
      .min(1, "At least one gear item is required"),
  }),
});

export const RentalValidation = {
  createRentalZodSchema,
};
