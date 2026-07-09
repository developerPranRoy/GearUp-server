import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { paginationHelpers } from "../../utils/paginationHelper";
import { gearSearchableFields } from "./gear.constant";
import { IGearFilterRequest } from "./gear.interface";

const createGearDb = async (providerId: string, payload: any) => {
  const result = await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
      availableStock: payload.totalStock,
    },
    include: { category: true },
  });

  return result;
};

const getAllGearDb = async (
  filters: IGearFilterRequest,
  options: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, category, brand, status } = filters;

  const andConditions: Prisma.GearItemWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: gearSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (category) {
    andConditions.push({ categoryId: category });
  }

  if (brand) {
    andConditions.push({ brand: { equals: brand, mode: "insensitive" } });
  }

  if (status) {
    andConditions.push({ status: status as any });
  }

  if (minPrice) {
    andConditions.push({ pricePerDay: { gte: Number(minPrice) } });
  }

  if (maxPrice) {
    andConditions.push({ pricePerDay: { lte: Number(maxPrice) } });
  }

  const whereConditions: Prisma.GearItemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.gearItem.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: { category: true, provider: { select: { id: true, name: true } } },
  });

  const total = await prisma.gearItem.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getGearByIdDb = async (id: string) => {
  const result = await prisma.gearItem.findUnique({
    where: { id },
    include: { category: true, provider: { select: { id: true, name: true } }, reviews: true },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  return result;
};

const updateGearDb = async (id: string, providerId: string, payload: any) => {
  const gear = await prisma.gearItem.findUnique({ where: { id } });

  if (!gear) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gear.providerId !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot update another provider's gear");
  }

  const result = await prisma.gearItem.update({ where: { id }, data: payload });
  return result;
};

const deleteGearDb = async (id: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({ where: { id } });

  if (!gear) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gear.providerId !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete another provider's gear");
  }

  const result = await prisma.gearItem.delete({ where: { id } });
  return result;
};

export const GearService = {
  createGearDb,
  getAllGearDb,
  getGearByIdDb,
  updateGearDb,
  deleteGearDb,
};
