import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { OAuth2Client } from "google-auth-library";
import ApiError from "../../errors/ApiError";
import config from "../../config";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { AuthRepository } from "./auth.repository";
import type { ILoginUser, ILoginUserResponse } from "./auth.interface";

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "PROVIDER";
}) => {
  const existing = await AuthRepository.findByEmail(payload.email);
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);
  return AuthRepository.create({ ...payload, password: hashedPassword });
};

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const user = await AuthRepository.findByEmail(payload.email);

  // Unified error prevents user enumeration
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }
  if (user.status === "SUSPENDED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been suspended");
  }

  const passwordMatch = await bcrypt.compare(payload.password, user.password ?? "");
  if (!passwordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwtHelpers.createToken(tokenPayload, config.jwt.secret, config.jwt.expiresIn);
  const refreshToken = jwtHelpers.createToken(tokenPayload, config.jwt.refreshSecret, config.jwt.refreshExpiresIn);

  return { accessToken, refreshToken };
};

const refreshAccessToken = async (token: string): Promise<{ accessToken: string }> => {
  let decoded: ReturnType<typeof jwtHelpers.verifyToken>;
  try {
    decoded = jwtHelpers.verifyToken(token, config.jwt.refreshSecret);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const user = await AuthRepository.findByIdWithPassword(decoded.id as string);
  if (!user || user.status === "SUSPENDED") {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User no longer active");
  }

  const accessToken = jwtHelpers.createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    config.jwt.expiresIn
  );
  return { accessToken };
};

const getMe = async (userId: string) => {
  const user = await AuthRepository.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const updateMe = async (userId: string, payload: { name?: string; phone?: string }) => {
  return AuthRepository.update(userId, payload);
};

const googleLogin = async (idToken: string): Promise<ILoginUserResponse> => {
  const client = new OAuth2Client(config.googleClientId);

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google token");
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Google token missing required fields");
  }

  const user = await AuthRepository.upsertGoogleUser({
    googleId: payload.sub,
    name: payload.name || payload.email.split("@")[0],
    email: payload.email,
  });

  if (user.status === "SUSPENDED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been suspended");
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwtHelpers.createToken(tokenPayload, config.jwt.secret, config.jwt.expiresIn);
  const refreshToken = jwtHelpers.createToken(tokenPayload, config.jwt.refreshSecret, config.jwt.refreshExpiresIn);

  return { accessToken, refreshToken };
};

export const AuthService = { registerUser, loginUser, refreshAccessToken, getMe, updateMe, googleLogin };
