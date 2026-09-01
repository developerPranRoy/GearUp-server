import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "./ApiError";
import config from "../config";

type ErrorDetail = { path: string | number; message: string };

const globalErrorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let errorDetails: ErrorDetail[] = [];

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = [{ path: "", message: error.message }];
  } else if (error instanceof ZodError) {
    statusCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = "Validation failed";
    errorDetails = error.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1] ?? "",
      message: issue.message,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(", ") ?? "field";
        statusCode = httpStatus.CONFLICT;
        message = `A record with this ${field} already exists`;
        errorDetails = [{ path: field, message }];
        break;
      }
      case "P2025":
        statusCode = httpStatus.NOT_FOUND;
        message = "Record not found";
        errorDetails = [{ path: "", message }];
        break;
      case "P2003":
        statusCode = httpStatus.BAD_REQUEST;
        message = "Operation failed due to a related record constraint";
        errorDetails = [{ path: "", message }];
        break;
      default:
        message = "Database error";
        errorDetails = [{ path: "", message: error.message }];
    }
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = [{ path: "", message: error.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
    ...(config.env !== "production" && { stack: error?.stack }),
  });
};

export default globalErrorHandler;
