import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RentalService } from "./rental.service";

const createRental = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.createRental(req.user!.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: result,
  });
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getMyRentals(req.user!.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getRentalById(
    req.params.id,
    req.user!.id as string,
    req.user!.role as string
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order retrieved successfully",
    data: result,
  });
});

const cancelRental = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.cancelRental(
    req.params.id,
    req.user!.id as string
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order cancelled successfully",
    data: result,
  });
});

export const RentalController = { createRental, getMyRentals, getRentalById, cancelRental };
