import { Server } from "http";
import app from "./app";
import config from "./config";
import prisma from "./shared/prisma";
import redis from "./shared/redis";

let server: Server;

async function bootstrap() {
  // Optionally connect Redis (non-blocking — app starts even if Redis is down)
  redis.connect().catch(() => {
    console.warn("[Redis] Could not connect — caching disabled");
  });

  server = app.listen(config.port, () => {
    console.log(
      `[GearUp] API running on port ${config.port} in ${config.env} mode`
    );
  });
}

async function gracefulShutdown(signal: string) {
  console.log(`[GearUp] ${signal} received — shutting down gracefully`);
  server?.close(async () => {
    await prisma.$disconnect();
    await redis.quit().catch(() => {});
    console.log("[GearUp] Server closed");
    process.exit(0);
  });

  // Force-exit after 10 s if graceful shutdown stalls
  setTimeout(() => {
    console.error("[GearUp] Forced exit after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("[GearUp] Uncaught exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("[GearUp] Unhandled rejection:", reason);
  gracefulShutdown("unhandledRejection");
});

bootstrap();
