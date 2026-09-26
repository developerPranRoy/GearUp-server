import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ApiError from "../../errors/ApiError";
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

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken: string };
  const data = await AuthService.googleLogin(idToken);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged in with Google successfully",
    data,
  });
});

const uploadAvatar = catchAsync(async (req: Request, res: Response) => {
  // multer-storage-cloudinary puts the secure_url on req.file
  const file = req.file as Express.Multer.File & { path: string };
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No image file provided");
  }
  const avatarUrl = file.path; // cloudinary secure_url
  const data = await AuthService.uploadAvatar(req.user!.id as string, avatarUrl);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Avatar updated successfully",
    data,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
  updateMe,
  googleLogin,
  uploadAvatar,
};
