import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { UssdService } from "../services/ussd.service";

const router = Router();

router.post(
  "/callback",
  asyncHandler(async (req, res) => {
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
