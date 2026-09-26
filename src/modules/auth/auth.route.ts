import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { authLimiter } from "../../middlewares/rateLimiter";
import { uploadAvatar } from "../../middlewares/upload";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.registerUser
);

router.post(
  "/login",
  authLimiter,
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken
);

router.post(
  "/google",
  authLimiter,
  AuthController.googleLogin
);

router.get(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  AuthController.getMe
);

router.patch(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  validateRequest(AuthValidation.updateMeZodSchema),
  AuthController.updateMe
);

router.post(
  "/me/avatar",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  uploadAvatar.single("avatar"),
  AuthController.uploadAvatar
);

export const AuthRoutes = router;
