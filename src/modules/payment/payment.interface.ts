export type ICreatePaymentInput = {
  rentalOrderId: string;
  method: "STRIPE" | "SSLCOMMERZ";
};

export type ICreatePaymentResponse = {
  payment: {
    id: string;
    transactionId: string;
    amount: number;
    method: string;
    status: string;
  };
  clientSecret: string | null;
};
