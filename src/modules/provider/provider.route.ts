import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { GearValidation } from "../gear/gear.validation";
import { GearController } from "../gear/gear.controller";
import { ProviderValidation } from "./provider.validation";
import { ProviderController } from "./provider.controller";

const router = express.Router();

router.post(
  "/gear",
  auth("PROVIDER"),
  validateRequest(GearValidation.createGearZodSchema),
  GearController.createGear
);

router.put(
  "/gear/:id",
  auth("PROVIDER"),
  validateRequest(GearValidation.updateGearZodSchema),
  GearController.updateGear
);

router.delete("/gear/:id", auth("PROVIDER"), GearController.deleteGear);

router.get("/orders", auth("PROVIDER"), ProviderController.getProviderOrders);

router.patch(
  "/orders/:id",
  auth("PROVIDER"),
  validateRequest(ProviderValidation.updateOrderStatusZodSchema),
  ProviderController.updateOrderStatus
);

export const ProviderRoutes = router;
