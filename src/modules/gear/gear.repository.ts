import { Prisma } from "@prisma/client";
import prisma from "../../shared/prisma";

const findMany = (
  where: Prisma.GearItemWhereInput,
  skip: number,
  take: number,
  orderBy: Prisma.GearItemOrderByWithRelationInput
) =>
  prisma.gearItem.findMany({
    where,
    skip,
    take,
    orderBy,
    include: { category: true, provider: { select: { id: true, name: true } } },
  });

const count = (where: Prisma.GearItemWhereInput) =>
  prisma.gearItem.count({ where });

const findById = (id: string) =>
  prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: { select: { id: true, name: true } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

const findByIdRaw = (id: string) =>
  prisma.gearItem.findUnique({ where: { id } });

const create = (data: Prisma.GearItemUncheckedCreateInput) =>
  prisma.gearItem.create({ data, include: { category: true } });

const update = (id: string, data: Prisma.GearItemUpdateInput) =>
  prisma.gearItem.update({ where: { id }, data });

const remove = (id: string) =>
  prisma.gearItem.delete({ where: { id } });

const findFirstActiveRental = (gearItemId: string) =>
  prisma.rentalOrderItem.findFirst({
    where: {
      gearItemId,
      rentalOrder: { status: { notIn: ["CANCELLED", "RETURNED"] } },
    },
  });

const findFirstAnyRental = (gearItemId: string) =>
  prisma.rentalOrderItem.findFirst({ where: { gearItemId } });

export const GearRepository = {
  findMany,
  count,
  findById,
  findByIdRaw,
  create,
  update,
  remove,
  findFirstActiveRental,
  findFirstAnyRental,
};
