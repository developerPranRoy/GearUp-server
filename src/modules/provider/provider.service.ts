import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { ProviderRepository } from "./provider.repository";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PLACED: ["CONFIRMED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
};

const getProviderOrders = (providerId: string) =>
  ProviderRepository.findOrdersByProvider(providerId);

const getProviderGear = (providerId: string) =>
  ProviderRepository.findGearByProvider(providerId);

const updateOrderStatus = async (
  orderId: string,
  providerId: string,
  status: "CONFIRMED" | "PICKED_UP" | "RETURNED"
) => {
  const order = await ProviderRepository.findOrderById(orderId);
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");

  const ownsOrder = order.items.some((item) => item.gearItem.providerId === providerId);
  if (!ownsOrder) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot update an order that is not yours");
  }

  if (!ALLOWED_TRANSITIONS[order.status]?.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot transition order from ${order.status} to ${status}`
    );
  }

  // Restore stock when gear is returned — wrapped in transaction
  if (status === "RETURNED") {
    return prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: { availableStock: { increment: item.quantity } },
        });
      }
      return tx.rentalOrder.update({ where: { id: orderId }, data: { status } });
    });
  }

  return ProviderRepository.updateOrderStatus(orderId, status);
};

export const ProviderService = { getProviderOrders, getProviderGear, updateOrderStatus };
