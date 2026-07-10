import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { GearValidation } from "./gear.validation";
import { GearController } from "./gear.controller";

const router = express.Router();

router.get("/", GearController.getAllGear);
router.get("/:id", GearController.getGearById);

router.post(
  "/",
  auth("PROVIDER"),
  validateRequest(GearValidation.createGearZodSchema),
  GearController.createGear
);

router.put(
  "/:id",
  auth("PROVIDER"),
  validateRequest(GearValidation.updateGearZodSchema),
  GearController.updateGear
);

router.delete("/:id", auth("PROVIDER"), GearController.deleteGear);

export const GearRoutes = router;
