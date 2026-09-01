import { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: { page: number; limit: number; total: number };
  data?: T;
};

const sendResponse = <T>(res: Response, payload: ApiResponse<T>): void => {
  res.status(payload.statusCode).json({
    success: payload.success,
    message: payload.message,
    ...(payload.meta && { meta: payload.meta }),
    data: payload.data,
  });
};

export default sendResponse;
