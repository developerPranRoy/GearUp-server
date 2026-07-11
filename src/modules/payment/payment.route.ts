import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { PaymentController } from "./payment.controller";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/create",
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.createPaymentZodSchema),
  PaymentController.createPayment
);

router.post(
  "/confirm",
  validateRequest(PaymentValidation.confirmPaymentZodSchema),
  PaymentController.confirmPayment
);

router.get("/",  auth(Role.CUSTOMER), PaymentController.getMyPayments);
router.get("/:id",  auth(Role.CUSTOMER,Role.ADMIN), PaymentController.getPaymentById);

export const PaymentRoutes = router;
