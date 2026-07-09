export type ICreatePaymentInput = {
  rentalOrderId: string;
  method: "STRIPE" | "SSLCOMMERZ";
};
