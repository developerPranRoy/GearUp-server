import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await PaymentService.createPaymentDb(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment session created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.confirmPaymentDb(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await PaymentService.getMyPaymentsDb(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const customerId = req.user?.id;
  const role = req.user?.role;
  const result = await PaymentService.getPaymentByIdDb(id, customerId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment retrieved successfully",
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
