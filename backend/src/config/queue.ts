import Bull from "bull";
import { env } from "./env";
import { logger } from "./logger";
import { redis, redisEnabled, redisAvailable } from "./redis";

/**
 * Lightweight stand-in for a Bull queue used when Redis is disabled.
 * All operations are no-ops so the rest of the app can call `.add()` /
 * `.process()` without guarding for Redis availability.
 */
class QueueStub {
  constructor(public readonly name: string) {}

  async add(): Promise<null> {
    logger.debug(`Queue ${this.name}: job skipped (Redis disabled)`);
    return null;
  }

  process(): void {
    /* no worker runs without Redis */
  }

  on(): this {
    return this;
  }

  async close(): Promise<void> {
    /* no-op */
  }
}

type QueueLike = Bull.Queue | QueueStub;

function createQueue(name: string): QueueLike {
  if (!redisEnabled) {
    return new QueueStub(name);
  }
  // Reuse the shared ioredis connection for all Bull clients.
  return new Bull(name, {
    createClient: () => redis as unknown as any,
  });
}

export const emailQueue = createQueue("email") as Bull.Queue;
export const smsQueue = createQueue("sms") as Bull.Queue;
export const pushQueue = createQueue("push") as Bull.Queue;
export const webhookQueue = createQueue("webhook") as Bull.Queue;
export const reportQueue = createQueue("report") as Bull.Queue;
export const maintenanceQueue = createQueue("maintenance") as Bull.Queue;

const queues: QueueLike[] = [emailQueue, smsQueue, pushQueue, webhookQueue, reportQueue, maintenanceQueue];

// Track which queues have already logged their first error to avoid spam.
const queueErrorLogged = new Set<string>();

export async function initializeQueues(): Promise<void> {
  if (!redisEnabled) {
    logger.info("Job queues disabled (REDIS_ENABLED=false) — background jobs are skipped");
    return;
  }

  for (const queue of queues as Bull.Queue[]) {
    queue.on("error", (err) => {
      if (!queueErrorLogged.has(queue.name)) {
        logger.warn(`Queue ${queue.name} unavailable (Redis offline)`, { error: err.message });
        queueErrorLogged.add(queue.name);
      }
    });

    queue.on("failed", (job, err) => {
      logger.error(`Job ${job.id} in ${queue.name} failed`, {
        jobId: job.id,
        error: err.message,
        data: job.data,
      });
    });

    queue.on("completed", (job) => {
      logger.debug(`Job ${job.id} in ${queue.name} completed`);
    });
  }

  logger.info("Job queues initialized");
}

export async function closeQueues(): Promise<void> {
  await Promise.all(queues.map((q) => q.close()));
  logger.info("Job queues closed");
}

/**
 * Safely add a job to a queue. Returns null without throwing when background
 * processing is unavailable (Redis disabled or offline).
 */
export async function safeQueueAdd(queue: Bull.Queue, data: unknown): Promise<Bull.Job | null> {
  if (!redisEnabled || !redisAvailable) {
    logger.debug(`Skipping job for queue ${queue.name} — background processing unavailable`);
    return null;
  }
  return queue.add(data as object);
}
