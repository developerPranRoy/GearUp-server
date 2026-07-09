import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../utils/jwtHelpers";
import config from "../config";

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);
      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
