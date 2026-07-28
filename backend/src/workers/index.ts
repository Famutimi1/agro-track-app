import "./email.worker";
import "./sms.worker";
import "./maintenance.worker";
import { scheduleMaintenanceJobs } from "./maintenance.worker";
import { logger } from "../config/logger";

// Register repeatable/scheduled jobs (safe to call on every boot — Bull dedupes
// repeatable jobs by name+cron).
scheduleMaintenanceJobs().catch((err) =>
  logger.warn("Failed to schedule maintenance jobs", { error: (err as Error).message })
);

logger.info("All workers initialized");
