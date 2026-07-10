import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RentalValidation } from "./rental.validation";
import { RentalController } from "./rental.controller";

const router = express.Router();

router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(RentalValidation.createRentalZodSchema),
  RentalController.createRental
);

router.get("/", auth("CUSTOMER"), RentalController.getMyRentals);
router.get("/:id", auth("CUSTOMER", "PROVIDER", "ADMIN"), RentalController.getRentalById);
router.patch("/:id/cancel", auth("CUSTOMER"), RentalController.cancelRental);

export const RentalRoutes = router;
