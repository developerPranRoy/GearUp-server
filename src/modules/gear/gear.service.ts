import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { invalidateCache } from "../../middlewares/cache";
import { paginationHelpers } from "../../utils/paginationHelper";
import { gearSearchableFields } from "./gear.constant";
import { GearRepository } from "./gear.repository";
import type { IGearFilterRequest, IGearCreateInput, IGearUpdateInput } from "./gear.interface";

const createGear = async (providerId: string, payload: IGearCreateInput) => {
  const result = await GearRepository.create({
    ...payload,
    providerId,
    availableStock: payload.totalStock,
  });
  await invalidateCache("cache:/api/gear*");
  return result;
};

const getAllGear = async (
  filters: IGearFilterRequest,
  options: { page?: string; limit?: string; sortBy?: string; sortOrder?: string }
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
  if (category) andConditions.push({ categoryId: category });
  if (brand) andConditions.push({ brand: { equals: brand, mode: "insensitive" } });
  if (status) andConditions.push({ status: status as Prisma.EnumGearStatusFilter });
  if (minPrice) andConditions.push({ pricePerDay: { gte: Number(minPrice) } });
  if (maxPrice) andConditions.push({ pricePerDay: { lte: Number(maxPrice) } });

  const where: Prisma.GearItemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    GearRepository.findMany(where, skip, limit, { [sortBy]: sortOrder }),
    GearRepository.count(where),
  ]);

  return { meta: { page, limit, total }, data };
};

const getGearById = async (id: string) => {
  const result = await GearRepository.findById(id);
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Gear item not found");
  return result;
};

const updateGear = async (id: string, providerId: string, payload: IGearUpdateInput) => {
  const gear = await GearRepository.findByIdRaw(id);
  if (!gear) throw new ApiError(httpStatus.NOT_FOUND, "Gear item not found");
  if (gear.providerId !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot update another provider's gear");
  }

  const result = await GearRepository.update(id, payload);
  await invalidateCache("cache:/api/gear*");
  return result;
};

const deleteGear = async (id: string, providerId: string) => {
  const gear = await GearRepository.findByIdRaw(id);
  if (!gear) throw new ApiError(httpStatus.NOT_FOUND, "Gear item not found");
  if (gear.providerId !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete another provider's gear");
  }

  const activeRental = await GearRepository.findFirstActiveRental(id);
  if (activeRental) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Cannot delete gear with active rentals. Cancel all active rentals first."
    );
  }

  const hasHistory = await GearRepository.findFirstAnyRental(id);
  if (hasHistory) {
    const result = await GearRepository.update(id, { status: "UNAVAILABLE" });
    await invalidateCache("cache:/api/gear*");
    return { ...result, softDeleted: true };
  }

  const result = await GearRepository.remove(id);
  await invalidateCache("cache:/api/gear*");
  return { ...result, softDeleted: false };
};

export const GearService = { createGear, getAllGear, getGearById, updateGear, deleteGear };
