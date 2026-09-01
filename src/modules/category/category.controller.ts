import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const data = await CategoryService.createCategory(req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Category created", data });
});

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const data = await CategoryService.getAllCategories();
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Categories retrieved", data });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const data = await CategoryService.updateCategory(req.params.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Category updated", data });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const data = await CategoryService.deleteCategory(req.params.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Category deleted", data });
});

export const CategoryController = { createCategory, getAllCategories, updateCategory, deleteCategory };
