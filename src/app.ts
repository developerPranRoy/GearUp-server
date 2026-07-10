import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import httpStatus from "http-status";
import routes from "./routes";
import globalErrorHandler from "./errors/globalErrorHandler";
import { PaymentController } from "./modules/payment/payment.controller";

const app: Application = express();

app.use(cors());

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "GearUp API is running" });
});

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorDetails: [{ path: req.originalUrl, message: "API Not Found" }],
  });
});

export default app;
