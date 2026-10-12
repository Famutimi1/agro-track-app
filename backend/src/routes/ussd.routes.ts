import crypto from "crypto";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";
import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { UssdService } from "../services/ussd.service";

const router = Router();

router.post(
  "/callback",
  asyncHandler(async (req, res) => {
    const secret = env.USSD_CALLBACK_SECRET;
    if (!secret) throw new ApiError(503, "USSD provider authentication is not configured");
    const authorization = req.headers.authorization || "";
    const expected = `Bearer ${secret}`;
    if (Buffer.byteLength(authorization) !== Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))) throw ApiError.unauthorized("Invalid provider authorization");
    const { sessionId, phoneNumber, text, serviceCode } = req.body;

    const result = await UssdService.handleSession({
      sessionId,
      phoneNumber,
      text: text || "",
      serviceCode,
    });

    // Africa's Talking expects plain text response
    res.set("Content-Type", "text/plain");
    res.send(result.response);
  })
);

export { router as ussdRoutes };
