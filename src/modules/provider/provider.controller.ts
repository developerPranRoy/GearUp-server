import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProviderService } from "./provider.service";

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const result = await ProviderService.getProviderOrdersDb(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const { id } = req.params;
  const { status } = req.body;
  const result = await ProviderService.updateOrderStatusDb(id, providerId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order status updated successfully",
    data: result,
  });
});

const getProviderGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const result = await ProviderService.getProviderGearDb(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear inventory retrieved successfully",
    data: result,
  });
});

export const ProviderController = {
  getProviderGear,
  getProviderOrders,
  updateOrderStatus,
};


