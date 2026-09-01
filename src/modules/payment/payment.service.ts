import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import stripe from "../../shared/stripe";
import config from "../../config";
import { PaymentRepository } from "./payment.repository";
import type { ICreatePaymentInput, ICreatePaymentResponse } from "./payment.interface";

const createPayment = async (
  customerId: string,
  payload: ICreatePaymentInput
): Promise<ICreatePaymentResponse> => {
  const rentalOrder = await PaymentRepository.findRentalById(payload.rentalOrderId);
  if (!rentalOrder) throw new ApiError(httpStatus.NOT_FOUND, "Rental order not found");
  if (rentalOrder.customerId !== customerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot pay for another customer's order");
  }
  if (rentalOrder.status !== "CONFIRMED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order must be confirmed before payment");
  }

  const existing = await PaymentRepository.findPendingByRentalId(payload.rentalOrderId);
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "A pending payment already exists for this order");
  }

  if (payload.method !== "STRIPE") {
    throw new ApiError(httpStatus.NOT_IMPLEMENTED, "SSLCommerz integration is not yet available");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(rentalOrder.totalAmount * 100),
    currency: config.stripe.currency,
    metadata: { rentalOrderId: payload.rentalOrderId, customerId },
    automatic_payment_methods: { enabled: true },
  });

  const payment = await PaymentRepository.create({
    transactionId: paymentIntent.id,
    rentalOrderId: payload.rentalOrderId,
    amount: rentalOrder.totalAmount,
    method: "STRIPE",
    status: "PENDING",
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
};

// Internal — only called by Stripe webhook
const markPaymentCompleted = async (transactionId: string): Promise<void> => {
  const payment = await PaymentRepository.findByTransactionId(transactionId);
  if (!payment || payment.status === "COMPLETED") return;
  await PaymentRepository.markCompleted(transactionId, payment.rentalOrderId);
};

const markPaymentFailed = async (transactionId: string): Promise<void> => {
  const payment = await PaymentRepository.findByTransactionId(transactionId);
  if (!payment) return;
  await PaymentRepository.markFailed(transactionId);
};

const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  if (!Buffer.isBuffer(rawBody)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid webhook body");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
  } catch {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Stripe webhook signature");
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await markPaymentCompleted((event.data.object as { id: string }).id);
      break;
    case "payment_intent.payment_failed":
      await markPaymentFailed((event.data.object as { id: string }).id);
      break;
    default:
      break;
  }

  return { received: true };
};

const getMyPayments = (customerId: string) =>
  PaymentRepository.findManyByCustomer(customerId);

const getPaymentById = async (id: string, userId: string, role: string) => {
  const payment = await PaymentRepository.findById(id);
  if (!payment) throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  if (role === "CUSTOMER" && payment.rentalOrder.customerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot view another customer's payment");
  }
  return payment;
};

export const PaymentService = {
  createPayment,
  handleStripeWebhook,
  getMyPayments,
  getPaymentById,
};
