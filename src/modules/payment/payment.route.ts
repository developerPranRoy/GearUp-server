import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post(
  "/create",
  auth("CUSTOMER"),
  validateRequest(PaymentValidation.createPaymentZodSchema),
  PaymentController.createPayment
);

router.post(
  "/confirm",
  validateRequest(PaymentValidation.confirmPaymentZodSchema),
  PaymentController.confirmPayment
);

router.get("/", auth("CUSTOMER"), PaymentController.getMyPayments);
router.get("/:id", auth("CUSTOMER", "ADMIN"), PaymentController.getPaymentById);

export const PaymentRoutes = router;
