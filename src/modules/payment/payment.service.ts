import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { ICreatePaymentInput } from "./payment.interface";

const createPaymentDb = async (customerId: string, payload: ICreatePaymentInput) => {
  const { rentalOrderId, method } = payload;

  const rentalOrder = await prisma.rentalOrder.findUnique({ where: { id: rentalOrderId } });

  if (!rentalOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot pay for another customer's order");
  }

  if (rentalOrder.status !== "CONFIRMED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order must be confirmed before payment");
  }

  const transactionId = `TXN-${uuidv4()}`;

  // NOTE: integrate actual Stripe PaymentIntent / SSLCommerz session creation here.
  const payment = await prisma.payment.create({
    data: {
      transactionId,
      rentalOrderId,
      amount: rentalOrder.totalAmount,
      method,
      status: "PENDING",
    },
  });

  return payment;
};

const confirmPaymentDb = async (payload: { transactionId: string; status: "COMPLETED" | "FAILED" }) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId: payload.transactionId } });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { transactionId: payload.transactionId },
      data: {
        status: payload.status,
        paidAt: payload.status === "COMPLETED" ? new Date() : null,
      },
    });

    if (payload.status === "COMPLETED") {
      await tx.rentalOrder.update({
        where: { id: payment.rentalOrderId },
        data: { status: "PAID" },
      });
    }

    return updatedPayment;
  });

  return result;
};

const getMyPaymentsDb = async (customerId: string) => {
  const result = await prisma.payment.findMany({
    where: { rentalOrder: { customerId } },
    include: { rentalOrder: true },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getPaymentByIdDb = async (id: string, customerId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (role === "CUSTOMER" && payment.rentalOrder.customerId !== customerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot view another customer's payment");
  }

  return payment;
};

export const PaymentService = {
  createPaymentDb,
  confirmPaymentDb,
  getMyPaymentsDb,
  getPaymentByIdDb,
};
