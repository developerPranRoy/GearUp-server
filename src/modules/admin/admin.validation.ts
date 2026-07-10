import { z } from "zod";

const updateUserStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], {
      required_error: "Status is required",
    }),
  }),
});

export const AdminValidation = {
  updateUserStatusZodSchema,
};
