import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";
import { ReviewController } from "./review.controller";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);

export const ReviewRoutes = router;
