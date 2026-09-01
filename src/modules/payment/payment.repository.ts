import { PaymentMethod } from "@prisma/client";
import prisma from "../../shared/prisma";

const findRentalById = (id: string) =>
  prisma.rentalOrder.findUnique({ where: { id } });

const findPendingByRentalId = (rentalOrderId: string) =>
  prisma.payment.findFirst({ where: { rentalOrderId, status: "PENDING" } });

const findByTransactionId = (transactionId: string) =>
  prisma.payment.findUnique({ where: { transactionId } });

const findById = (id: string) =>
  prisma.payment.findUnique({ where: { id }, include: { rentalOrder: true } });

const findManyByCustomer = (customerId: string) =>
  prisma.payment.findMany({
    where: { rentalOrder: { customerId } },
    include: { rentalOrder: true },
    orderBy: { createdAt: "desc" },
  });

const create = (data: {
  transactionId: string;
  rentalOrderId: string;
  amount: number;
  method: PaymentMethod;
  status: "PENDING";
}) => prisma.payment.create({ data });

const markCompleted = (transactionId: string, rentalOrderId: string) =>
  prisma.$transaction([
    prisma.payment.update({
      where: { transactionId },
      data: { status: "COMPLETED", paidAt: new Date() },
    }),
    prisma.rentalOrder.update({
      where: { id: rentalOrderId },
      data: { status: "PAID" },
    }),
  ]);

const markFailed = (transactionId: string) =>
  prisma.payment.update({ where: { transactionId }, data: { status: "FAILED" } });

export const PaymentRepository = {
  findRentalById,
  findPendingByRentalId,
  findByTransactionId,
  findById,
  findManyByCustomer,
  create,
  markCompleted,
  markFailed,
};
