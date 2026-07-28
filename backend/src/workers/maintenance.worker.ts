import { maintenanceQueue } from "../config/queue";
import { logger } from "../config/logger";
import { env } from "../config/env";
import { MessageService } from "../services/message.service";

const MESSAGE_RETENTION_JOB = "message-retention";

maintenanceQueue.process(MESSAGE_RETENTION_JOB, async () => {
  // Default-off: MESSAGE_RETENTION_DAYS=0 means keep messages forever. Only when
  // an operator sets a positive window do we prune older messages. Deletion is
  // irreversible, so this is opt-in by configuration.
  const days = env.MESSAGE_RETENTION_DAYS;
  if (!days || days <= 0) {
    logger.debug("Message retention disabled (MESSAGE_RETENTION_DAYS=0)");
    return { deleted: 0, skipped: true };
  }

  const deleted = await MessageService.purgeOldMessages(days);
  logger.info("Message retention sweep complete", { days, deleted });
  return { deleted };
});

// Schedule a daily repeatable sweep. Bull dedupes repeatable jobs by name+cron,
// so re-registering on each boot is safe. Only meaningful when Redis is enabled.
export async function scheduleMaintenanceJobs(): Promise<void> {
  if (!env.REDIS_ENABLED) return;
  await maintenanceQueue.add(
    MESSAGE_RETENTION_JOB,
    {},
    { repeat: { cron: "17 3 * * *" }, removeOnComplete: true, removeOnFail: 20 }
  );
  logger.info("Maintenance jobs scheduled", {
    retentionDays: env.MESSAGE_RETENTION_DAYS,
  });
}

logger.info("Maintenance worker started");
