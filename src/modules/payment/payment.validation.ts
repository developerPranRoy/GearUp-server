import { z } from "zod";

const createPaymentZodSchema = z.object({
  body: z.object({
    rentalOrderId: z.string({ required_error: "Rental order ID is required" }),
    method: z.enum(["STRIPE", "SSLCOMMERZ"], {
      required_error: "Payment method is required",
    }),
  }),
});

export const PaymentValidation = { createPaymentZodSchema };
