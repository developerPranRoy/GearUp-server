import prisma from "../../shared/prisma";

const findAll = () =>
  prisma.category.findMany({ orderBy: { name: "asc" } });

const findById = (id: string) =>
  prisma.category.findUnique({ where: { id } });

const create = (data: { name: string; description?: string }) =>
  prisma.category.create({ data });

const update = (id: string, data: { name?: string; description?: string }) =>
  prisma.category.update({ where: { id }, data });

const remove = (id: string) =>
  prisma.category.delete({ where: { id } });

const countGear = (id: string) =>
  prisma.gearItem.count({ where: { categoryId: id } });

export const CategoryRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
  countGear,
};
