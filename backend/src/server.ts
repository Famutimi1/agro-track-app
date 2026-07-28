import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { connectRedis, redis, redisEnabled } from "./config/redis";
import { logger } from "./config/logger";
import { initializeSocket, closeSocketRedis } from "./config/socket";
import { initializeQueues, closeQueues } from "./config/queue";

async function main() {
  await prisma.$connect();
  logger.info("Database connected");

  await connectRedis();

  await initializeQueues();

  // Import workers (they self-register). Only meaningful when Redis is enabled.
  if (redisEnabled) {
    await import("./workers");
  }

  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(env.PORT, () => {
    logger.info(`AgroTrack API running on http://localhost:${env.PORT}`, {
      environment: env.NODE_ENV,
    });
  });
}

main().catch((err) => {
  logger.error("Failed to start server", { error: err.message });
  process.exit(1);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down gracefully...");
  await closeQueues().catch(() => {});
  await closeSocketRedis().catch(() => {});
  await redis.quit().catch(() => {});
  await prisma.$disconnect();
  process.exit(0);
});
