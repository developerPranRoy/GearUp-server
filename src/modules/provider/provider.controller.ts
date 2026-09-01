import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProviderService } from "./provider.service";

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const data = await ProviderService.getProviderOrders(req.user!.id as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Orders retrieved", data });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await ProviderService.updateOrderStatus(
    req.params.id,
    req.user!.id as string,
    req.body.status
  );
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Order status updated", data });
});

const getProviderGear = catchAsync(async (req: Request, res: Response) => {
  const data = await ProviderService.getProviderGear(req.user!.id as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Inventory retrieved", data });
});

export const ProviderController = { getProviderGear, getProviderOrders, updateOrderStatus };
