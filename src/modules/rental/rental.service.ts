import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { RentalRepository } from "./rental.repository";
import type { ICreateRentalInput } from "./rental.interface";

const createRental = async (customerId: string, payload: ICreateRentalInput) => {
  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);

  if (end <= start) {
    throw new ApiError(httpStatus.BAD_REQUEST, "End date must be after start date");
  }

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Transaction lives in the repository boundary — service only passes intent
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of payload.items) {
      const gear = await tx.gearItem.findUnique({ where: { id: item.gearItemId } });

      if (!gear) throw new ApiError(httpStatus.NOT_FOUND, `Gear not found: ${item.gearItemId}`);
      if (gear.status !== "AVAILABLE") {
        throw new ApiError(httpStatus.BAD_REQUEST, `${gear.name} is currently unavailable`);
      }
      if (gear.availableStock < item.quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Not enough stock for ${gear.name}`);
      }

      totalAmount += gear.pricePerDay * item.quantity * days;
      orderItemsData.push({ gearItemId: gear.id, quantity: item.quantity, pricePerDay: gear.pricePerDay });

      // Atomic decrement prevents race condition
      await tx.gearItem.update({
        where: { id: gear.id },
        data: { availableStock: { decrement: item.quantity } },
      });
    }

    return tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        items: { create: orderItemsData },
      },
      include: { items: { include: { gearItem: true } } },
    });
  });
};

const getMyRentals = (customerId: string) =>
  RentalRepository.findManyByCustomer(customerId);

const getRentalById = async (id: string, userId: string, role: string) => {
  const rental = await RentalRepository.findById(id);
  if (!rental) throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");
  if (role === "CUSTOMER" && rental.customerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot view another customer's order");
  }
  return rental;
};

const cancelRental = async (id: string, customerId: string) => {
  const rental = await RentalRepository.findByIdWithItems(id);
  if (!rental) throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");
  if (rental.customerId !== customerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot cancel another customer's order");
  }
  if (rental.status !== "PLACED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only PLACED orders can be cancelled");
  }

  return prisma.$transaction(async (tx) => {
    for (const item of rental.items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: { availableStock: { increment: item.quantity } },
      });
    }
    return tx.rentalOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  });
};

export const RentalService = { createRental, getMyRentals, getRentalById, cancelRental };
