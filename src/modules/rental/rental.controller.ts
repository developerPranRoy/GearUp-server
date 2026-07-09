import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RentalService } from "./rental.service";

const createRental = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await RentalService.createRentalDb(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: result,
  });
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await RentalService.getMyRentalsDb(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;
  const result = await RentalService.getRentalByIdDb(id, userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order retrieved successfully",
    data: result,
  });
});

const cancelRental = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const customerId = req.user?.id;
  const result = await RentalService.cancelRentalDb(id, customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order cancelled successfully",
    data: result,
  });
});

export const RentalController = {
  createRental,
  getMyRentals,
  getRentalById,
  cancelRental,
};
