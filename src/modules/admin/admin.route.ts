import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidation } from "./admin.validation";
import { AdminController } from "./admin.controller";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);
router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  validateRequest(AdminValidation.updateUserStatusZodSchema),
  AdminController.updateUserStatus
);
router.get("/gear", auth(Role.ADMIN), AdminController.getAllGear);
router.get("/rentals", auth(Role.ADMIN), AdminController.getAllRentals);

export const AdminRoutes = router;
