import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { paginationHelpers, type PaginationOptions } from "../../utils/paginationHelper";
import { AdminRepository } from "./admin.repository";

const getAllUsers = async (options: PaginationOptions) => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const [data, total] = await Promise.all([
    AdminRepository.findAllUsers(skip, limit),
    AdminRepository.countUsers(),
  ]);
  return { meta: { page, limit, total }, data };
};

const updateUserStatus = async (userId: string, status: "ACTIVE" | "SUSPENDED") => {
  const user = await AdminRepository.findUserById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  return AdminRepository.updateUserStatus(userId, status);
};

const getAllGear = async (options: PaginationOptions) => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const [data, total] = await Promise.all([
    AdminRepository.findAllGear(skip, limit),
    AdminRepository.countGear(),
  ]);
  return { meta: { page, limit, total }, data };
};

const getAllRentals = async (options: PaginationOptions) => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const [data, total] = await Promise.all([
    AdminRepository.findAllRentals(skip, limit),
    AdminRepository.countRentals(),
  ]);
  return { meta: { page, limit, total }, data };
};

export const AdminService = { getAllUsers, updateUserStatus, getAllGear, getAllRentals };
