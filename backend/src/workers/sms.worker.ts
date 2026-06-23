import { smsQueue } from "../config/queue";
import { logger } from "../config/logger";
import { env } from "../config/env";

interface SmsJob {
  to: string;
  message: string;
}

smsQueue.process(async (job) => {
  const { to, message } = job.data as SmsJob;

  logger.info("Processing SMS job", { jobId: job.id, to });

  // In production, use Termii
  if (env.TERMII_API_KEY) {
    const response = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: env.TERMII_API_KEY,
        to,
        from: "AgroTrack",
        sms: message,
        type: "plain",
        channel: "generic",
      }),
    });

    const result = (await response.json()) as { code: string; message: string };
    if (result.code !== "ok") {
      throw new Error(`Termii error: ${result.message}`);
    }
  } else {
    logger.info("SMS sent (mock)", { to, message: message.slice(0, 50) });
  }

  return { sent: true };
});

logger.info("SMS worker started");
