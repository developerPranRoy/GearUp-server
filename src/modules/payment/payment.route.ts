import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { PaymentController } from "./payment.controller";

const router = Router();

// Webhook is registered directly on app.ts (needs raw body — before JSON parser)

router.post(
  "/create",
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.createPaymentZodSchema),
  PaymentController.createPayment
);

router.get("/", auth(Role.CUSTOMER), PaymentController.getMyPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), PaymentController.getPaymentById);

export const PaymentRoutes = router;
