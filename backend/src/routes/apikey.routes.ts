import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { ApiKeyService } from "../services/apikey.service";

const router = Router();

router.post(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const key = await ApiKeyService.create(req.user!.sub, req.body);
    res.status(201).json({ success: true, data: key });
  })
);

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const keys = await ApiKeyService.list(req.user!.sub);
    res.json({ success: true, data: keys });
  })
);

router.patch(
  "/:id/revoke",
  authenticate,
  asyncHandler(async (req, res) => {
    await ApiKeyService.revoke(req.user!.sub, req.params.id);
    res.json({ success: true, message: "API key revoked" });
  })
);

router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    await ApiKeyService.delete(req.user!.sub, req.params.id);
    res.json({ success: true, message: "API key deleted" });
  })
);

export { router as apiKeyRoutes };
