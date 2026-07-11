import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RentalValidation } from "./rental.validation";
import { RentalController } from "./rental.controller";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
   auth(Role.CUSTOMER),
  validateRequest(RentalValidation.createRentalZodSchema),
  RentalController.createRental
);

router.get("/", auth(Role.CUSTOMER), RentalController.getMyRentals);
router.get("/:id", auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), RentalController.getRentalById);
router.patch("/:id/cancel", auth(Role.CUSTOMER), RentalController.cancelRental);

export const RentalRoutes = router;
