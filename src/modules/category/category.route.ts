import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidation } from "./category.validation";
import { CategoryController } from "./category.controller";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", CategoryController.getAllCategories);

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategory
);

router.delete("/:id", auth(Role.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
