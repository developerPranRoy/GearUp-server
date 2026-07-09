import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { GearValidation } from "../gear/gear.validation";
import { GearController } from "../gear/gear.controller";
import { ProviderController } from "./provider.controller";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/gear",
  auth(Role.PROVIDER),
  validateRequest(GearValidation.createGearZodSchema),
  GearController.createGear
);

router.put(
  "/gear/:id",
  auth(Role.PROVIDER),
  validateRequest(GearValidation.updateGearZodSchema),
  GearController.updateGear
);

router.delete("/gear/:id", auth(Role.PROVIDER), GearController.deleteGear);

router.get("/orders", auth(Role.PROVIDER), ProviderController.getProviderOrders);

router.patch("/orders/:id", auth(Role.PROVIDER), ProviderController.updateOrderStatus);

export const ProviderRoutes = router;
