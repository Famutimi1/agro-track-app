import { emailQueue } from "../config/queue";
import { logger } from "../config/logger";
import { env } from "../config/env";

interface EmailJob {
  to: string;
  subject: string;
  body: string;
  name?: string;
  data?: Record<string, any>;
}

emailQueue.process(async (job) => {
  const { to, subject, body, name } = job.data as EmailJob;

  logger.info("Processing email job", { jobId: job.id, to });

  // In production, use SendGrid
  if (env.SENDGRID_API_KEY) {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to, name }] }],
        from: { email: env.FROM_EMAIL, name: "AgroTrack" },
        subject,
        content: [
          {
            type: "text/plain",
            value: body,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }
  } else {
    // Mock email in development
    logger.info("Email sent (mock)", { to, subject });
  }

  return { sent: true };
});

logger.info("Email worker started");
