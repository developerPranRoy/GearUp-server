import prisma from "../../shared/prisma";

const findManyByCustomer = (customerId: string) =>
  prisma.rentalOrder.findMany({
    where: { customerId },
    include: { items: { include: { gearItem: true } }, payments: true },
    orderBy: { createdAt: "desc" },
  });

const findById = (id: string) =>
  prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      items: { include: { gearItem: true } },
      payments: true,
      customer: { select: { id: true, name: true, email: true } },
    },
  });

const findByIdWithItems = (id: string) =>
  prisma.rentalOrder.findUnique({ where: { id }, include: { items: true } });

const create = (data: {
  customerId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  items: { create: { gearItemId: string; quantity: number; pricePerDay: number }[] };
}) =>
  prisma.rentalOrder.create({
    data,
    include: { items: { include: { gearItem: true } } },
  });

const updateStatus = (id: string, status: string) =>
  prisma.rentalOrder.update({ where: { id }, data: { status: status as any } });

export const RentalRepository = {
  findManyByCustomer,
  findById,
  findByIdWithItems,
  create,
  updateStatus,
};
