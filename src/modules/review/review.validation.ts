import { z } from "zod";

const createReviewZodSchema = z.object({
  body: z.object({
    gearItemId: z.string({ required_error: "Gear item id is required" }),
    rating: z.number({ required_error: "Rating is required" }).min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewZodSchema,
};
