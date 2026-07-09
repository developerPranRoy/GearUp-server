import { z } from "zod";

const createPaymentZodSchema = z.object({
  body: z.object({
    rentalOrderId: z.string({ required_error: "Rental order id is required" }),
    method: z.enum(["STRIPE", "SSLCOMMERZ"], { required_error: "Payment method is required" }),
  }),
});

const confirmPaymentZodSchema = z.object({
  body: z.object({
    transactionId: z.string({ required_error: "Transaction id is required" }),
    status: z.enum(["COMPLETED", "FAILED"], { required_error: "Status is required" }),
  }),
});

export const PaymentValidation = {
  createPaymentZodSchema,
  confirmPaymentZodSchema,
};
