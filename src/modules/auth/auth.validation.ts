import { z } from "zod";

const registerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }).min(6),
    phone: z.string().optional(),
    role: z.enum(["CUSTOMER", "PROVIDER"], {
      required_error: "Role is required",
    }),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const AuthValidation = {
  registerZodSchema,
  loginZodSchema,
};
