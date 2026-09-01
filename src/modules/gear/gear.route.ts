import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { cache } from "../../middlewares/cache";
import { GearValidation } from "./gear.validation";
import { GearController } from "./gear.controller";

const router = Router();

router.get("/", cache(60), GearController.getAllGear);
router.get("/:id", cache(120), GearController.getGearById);

router.post(
  "/",
  auth(Role.PROVIDER),
  validateRequest(GearValidation.createGearZodSchema),
  GearController.createGear
);

router.put(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(GearValidation.updateGearZodSchema),
  GearController.updateGear
);

router.delete("/:id", auth(Role.PROVIDER), GearController.deleteGear);

export const GearRoutes = router;
