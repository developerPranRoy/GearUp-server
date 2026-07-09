import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { GearService } from "./gear.service";
import { gearFilterableFields } from "./gear.constant";
import pick from "../../shared/pick";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const result = await GearService.createGearDb(providerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear added successfully",
    data: result,
  });
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, gearFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await GearService.getAllGearDb(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GearService.getGearByIdDb(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const providerId = req.user?.id;
  const result = await GearService.updateGearDb(id, providerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const providerId = req.user?.id;
  const result = await GearService.deleteGearDb(id, providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear removed successfully",
    data: result,
  });
});

export const GearController = {
  createGear,
  getAllGear,
  getGearById,
  updateGear,
  deleteGear,
};
