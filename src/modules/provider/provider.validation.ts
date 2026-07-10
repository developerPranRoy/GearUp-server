import { z } from "zod";

const updateOrderStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "PICKED_UP", "RETURNED"], {
      required_error: "Status is required",
    }),
  }),
});

export const ProviderValidation = {
  updateOrderStatusZodSchema,
};
