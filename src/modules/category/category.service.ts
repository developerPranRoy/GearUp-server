import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const createCategoryDb = async (payload: { name: string; description?: string }) => {
  const result = await prisma.category.create({ data: payload });
  return result;
};

const getAllCategoriesDb = async () => {
  const result = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const updateCategoryDb = async (
  id: string,
  payload: { name?: string; description?: string }
) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  const result = await prisma.category.update({ where: { id }, data: payload });
  return result;
};

const deleteCategoryDb = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  const result = await prisma.category.delete({ where: { id } });
  return result;
};

export const CategoryService = {
  createCategoryDb,
  getAllCategoriesDb,
  updateCategoryDb,
  deleteCategoryDb,
};
