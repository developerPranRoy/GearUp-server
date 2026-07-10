import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import httpStatus from "http-status";
import ApiError from "./ApiError";
import config from "../config";

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorDetails: { path: string | number; message: string }[] = [];

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = error.message ? [{ path: "", message: error.message }] : [];
  } else if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorDetails = error.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = error.message ? [{ path: "", message: error.message }] : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
    stack: config.env !== "production" ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
