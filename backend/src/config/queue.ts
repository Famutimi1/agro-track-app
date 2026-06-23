import Bull from "bull";
import { env } from "./env";
import { logger } from "./logger";

const redisConfig = {
  redis: env.REDIS_URL,
};

export const emailQueue = new Bull("email", redisConfig);
export const smsQueue = new Bull("sms", redisConfig);
export const pushQueue = new Bull("push", redisConfig);
export const webhookQueue = new Bull("webhook", redisConfig);
export const reportQueue = new Bull("report", redisConfig);

const queues = [emailQueue, smsQueue, pushQueue, webhookQueue, reportQueue];

export async function initializeQueues(): Promise<void> {
  for (const queue of queues) {
    queue.on("error", (err) => {
      logger.error(`Queue ${queue.name} error`, { error: err.message });
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
