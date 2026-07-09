import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import config from "../../config";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { ILoginUser, ILoginUserResponse } from "./auth.interface";

const registerUserDb = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "PROVIDER";
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return result;
};

const loginUserDb = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (user.status === "SUSPENDED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been suspended");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const accessToken = jwtHelpers.createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return { accessToken, refreshToken };
};

const getMeDb = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

export const AuthService = {
  registerUserDb,
  loginUserDb,
  getMeDb,
};
