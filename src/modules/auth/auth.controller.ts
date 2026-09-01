import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthService.registerUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Account created successfully",
    data,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthService.loginUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged in successfully",
    data,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  const data = await AuthService.refreshAccessToken(refreshToken);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Token refreshed",
    data,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthService.getMe(req.user!.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile retrieved",
    data,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthService.updateMe(req.user!.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated",
    data,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
  updateMe,
};
