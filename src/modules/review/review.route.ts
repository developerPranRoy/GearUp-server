import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);

export const ReviewRoutes = router;
