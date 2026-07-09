import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { ICreateRentalInput } from "./rental.interface";

const createRentalDb = async (customerId: string, payload: ICreateRentalInput) => {
  const { startDate, endDate, items } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new ApiError(httpStatus.BAD_REQUEST, "End date must be after start date");
  }

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const result = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const gear = await tx.gearItem.findUnique({ where: { id: item.gearItemId } });

      if (!gear) {
        throw new ApiError(httpStatus.NOT_FOUND, `Gear item not found: ${item.gearItemId}`);
      }

      if (gear.status !== "AVAILABLE") {
        throw new ApiError(httpStatus.BAD_REQUEST, `${gear.name} is currently unavailable`);
      }

      if (gear.availableStock < item.quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Not enough stock for ${gear.name}`);
      }

      totalAmount += gear.pricePerDay * item.quantity * days;

      orderItemsData.push({
        gearItemId: gear.id,
        quantity: item.quantity,
        pricePerDay: gear.pricePerDay,
      });

      await tx.gearItem.update({
        where: { id: gear.id },
        data: { availableStock: gear.availableStock - item.quantity },
      });
    }

    const rentalOrder = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        items: { create: orderItemsData },
      },
      include: { items: { include: { gearItem: true } } },
    });

    return rentalOrder;
  });

  return result;
};

const getMyRentalsDb = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: { items: { include: { gearItem: true } }, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getRentalByIdDb = async (id: string, userId: string, role: string) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      items: { include: { gearItem: true } },
      payments: true,
      customer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!rental) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (role === "CUSTOMER" && rental.customerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot view another customer's order");
  }

  return rental;
};

const cancelRentalDb = async (id: string, customerId: string) => {
  const rental = await prisma.rentalOrder.findUnique({ where: { id }, include: { items: true } });

  if (!rental) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (rental.customerId !== customerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot cancel another customer's order");
  }

  if (rental.status !== "PLACED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only PLACED orders can be cancelled");
  }

  const result = await prisma.$transaction(async (tx) => {
    for (const item of rental.items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: { availableStock: { increment: item.quantity } },
      });
    }

    return tx.rentalOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  });

  return result;
};

export const RentalService = {
  createRentalDb,
  getMyRentalsDb,
  getRentalByIdDb,
  cancelRentalDb,
};
