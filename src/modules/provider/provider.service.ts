import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const getProviderOrdersDb = async (providerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId } } } },
    include: {
      items: { include: { gearItem: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateOrderStatusDb = async (
  orderId: string,
  providerId: string,
  status: "CONFIRMED" | "PICKED_UP" | "RETURNED"
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: { items: { include: { gearItem: true } } },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  const ownsOrder = order.items.some((item) => item.gearItem.providerId === providerId);

  if (!ownsOrder) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot update an order that isn't yours");
  }

  const allowedTransitions: Record<string, string[]> = {
    PLACED: ["CONFIRMED"],
    PAID: ["PICKED_UP"],
    PICKED_UP: ["RETURNED"],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot move order from ${order.status} to ${status}`
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    if (status === "RETURNED") {
      for (const item of order.items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: { availableStock: { increment: item.quantity } },
        });
      }
    }

    return tx.rentalOrder.update({ where: { id: orderId }, data: { status } });
  });

  return result;
};

export const ProviderService = {
  getProviderOrdersDb,
  updateOrderStatusDb,
};
