import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const data = await ReviewService.createReview(req.user!.id as string, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Review submitted", data });
});

export const ReviewController = { createReview };
