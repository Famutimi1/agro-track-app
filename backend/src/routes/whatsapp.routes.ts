import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { WhatsAppService } from "../services/whatsapp.service";
import { logger } from "../config/logger";

const router = Router();

// Webhook verification (GET)
router.get(
  "/webhook",
  asyncHandler(async (req, res) => {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    const result = WhatsAppService.verifyWebhook(mode, token, challenge);

    if (result) {
      res.status(200).send(result);
    } else {
      res.sendStatus(403);
    }
  })
);

// Webhook handler (POST)
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-hub-signature-256"] as string;

    if (!signature || !req.rawBody || !WhatsAppService.verifySignature(req.rawBody, signature)) {
      logger.warn("Invalid WhatsApp webhook signature");
      return res.sendStatus(401);
    }

    await WhatsAppService.handleWebhook(req.body);

    res.sendStatus(200);
  })
);

export { router as whatsappRoutes };
