import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { invalidateCache } from "../../middlewares/cache";
import { CategoryRepository } from "./category.repository";

const createCategory = async (payload: { name: string; description?: string }) => {
  const result = await CategoryRepository.create(payload);
  await invalidateCache("cache:/api/categories*");
  return result;
};

const getAllCategories = () => CategoryRepository.findAll();

const updateCategory = async (id: string, payload: { name?: string; description?: string }) => {
  const existing = await CategoryRepository.findById(id);
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

  const result = await CategoryRepository.update(id, payload);
  await invalidateCache("cache:/api/categories*");
  return result;
};

const deleteCategory = async (id: string) => {
  const existing = await CategoryRepository.findById(id);
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

  const gearCount = await CategoryRepository.countGear(id);
  if (gearCount > 0) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Cannot delete category — ${gearCount} gear item(s) are still assigned to it`
    );
  }

  const result = await CategoryRepository.remove(id);
  await invalidateCache("cache:/api/categories*");
  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
