import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../utils/jwtHelpers";
import config from "../config";

/**
 * Authentication + authorisation middleware.
 *
 * Verifies the Bearer JWT, attaches the decoded payload to req.user, and
 * optionally enforces that the caller has one of the allowed roles.
 */
const auth = (...requiredRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization?.trim();
      const token =
        authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
      }

      const decoded = jwtHelpers.verifyToken(token, config.jwt.secret);
      req.user = decoded as Request["user"];

      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role as string)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You do not have permission to perform this action"
        );
      }

      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, "Token has expired"));
      }
      if (error instanceof JsonWebTokenError) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid token"));
      }
      next(error);
    }
  };
};

export default auth;
