import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import httpStatus from "http-status";

import config from "./config";
import routes from "./routes";
import globalErrorHandler from "./errors/globalErrorHandler";
import { apiLimiter } from "./middlewares/rateLimiter";
import { PaymentController } from "./modules/payment/payment.controller";

const app: Application = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no origin) and whitelisted origins
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Logging ─────────────────────────────────────────────────────────────────
if (config.env !== "test") {
  app.use(morgan(config.env === "production" ? "combined" : "dev"));
}

// ─── Stripe webhook (must receive raw body BEFORE json parser) ────────────────
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhook
);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Global rate limiting ────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "GearUp API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 handler (must be before global error handler) ───────────────────────
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Route not found",
    errorDetails: [{ path: req.originalUrl, message: "API endpoint does not exist" }],
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
