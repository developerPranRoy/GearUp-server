import prisma from "../../shared/prisma";

const findOrdersByProvider = (providerId: string) =>
  prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId } } } },
    include: {
      items: { include: { gearItem: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

const findOrderById = (id: string) =>
  prisma.rentalOrder.findUnique({
    where: { id },
    include: { items: { include: { gearItem: true } } },
  });

const findGearByProvider = (providerId: string) =>
  prisma.gearItem.findMany({
    where: { providerId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

const updateOrderStatus = (id: string, status: string) =>
  prisma.rentalOrder.update({ where: { id }, data: { status: status as any } });

const incrementGearStock = (gearItemId: string, quantity: number) =>
  prisma.gearItem.update({
    where: { id: gearItemId },
    data: { availableStock: { increment: quantity } },
  });

export const ProviderRepository = {
  findOrdersByProvider,
  findOrderById,
  findGearByProvider,
  updateOrderStatus,
  incrementGearStock,
};
