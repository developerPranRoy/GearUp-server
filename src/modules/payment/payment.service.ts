import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import stripe from "../../shared/stripe";
import config from "../../config";
import { ICreatePaymentInput, ICreatePaymentResponse } from "./payment.interface";

const createPaymentDb = async (
  customerId: string,
  payload: ICreatePaymentInput
): Promise<ICreatePaymentResponse> => {
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

  const existingPendingPayment = await prisma.payment.findFirst({
    where: { rentalOrderId, status: "PENDING" },
  });

  if (existingPendingPayment) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A pending payment already exists for this order"
    );
  }

  if (method === "STRIPE") {
    const amountInSmallestUnit = Math.round(rentalOrder.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: config.stripe_currency as string,
      metadata: {
        rentalOrderId,
        customerId,
      },
      automatic_payment_methods: { enabled: true },
    });

    const payment = await prisma.payment.create({
      data: {
        transactionId: paymentIntent.id,
        rentalOrderId,
        amount: rentalOrder.totalAmount,
        method: "STRIPE",
        status: "PENDING",
      },
    });

    return {
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
      },
      clientSecret: paymentIntent.client_secret,
    };
  }


  const transactionId = `TXN-${uuidv4()}`;

  const payment = await prisma.payment.create({
    data: {
      transactionId,
      rentalOrderId,
      amount: rentalOrder.totalAmount,
      method: "SSLCOMMERZ",
      status: "PENDING",
    },
  });

  return {
    payment: {
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
    },
    clientSecret: null,
  };
};

const markPaymentCompletedDb = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });

  if (!payment) {
   
    return;
  }

  if (payment.status === "COMPLETED") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { transactionId },
      data: { status: "COMPLETED", paidAt: new Date() },
    });

    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: { status: "PAID" },
    });
  });
};

const markPaymentFailedDb = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });

  if (!payment) {
    return;
  }

  await prisma.payment.update({
    where: { transactionId },
    data: { status: "FAILED" },
  });
};

const handleStripeWebhookDb = async (rawBody: Buffer, signature: string) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret as string
    );
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Stripe webhook signature");
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as { id: string };
      await markPaymentCompletedDb(paymentIntent.id);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as { id: string };
      await markPaymentFailedDb(paymentIntent.id);
      break;
    }
    default:
      break;
  }

  return { received: true };
};

const confirmPaymentDb = async (payload: {
  transactionId: string;
  status: "COMPLETED" | "FAILED";
}) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId: payload.transactionId } });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payload.status === "COMPLETED") {
    await markPaymentCompletedDb(payload.transactionId);
  } else {
    await markPaymentFailedDb(payload.transactionId);
  }

  const result = await prisma.payment.findUnique({ where: { transactionId: payload.transactionId } });
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
  handleStripeWebhookDb,
  confirmPaymentDb,
  getMyPaymentsDb,
  getPaymentByIdDb,
};
