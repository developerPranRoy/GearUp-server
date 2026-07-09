import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsersDb();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await AdminService.updateUserStatusDb(id, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllGearDb();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear listings retrieved successfully",
    data: result,
  });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllRentalsDb();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
