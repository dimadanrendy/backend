import express from "express";
import {
  GetAuth,
  PostAuth,
  DeleteAuth,
  GetAuthById,
  RefreshSession,
} from "../controllers/useAuthController.js";
import {
  useAccessToken,
  useRefreshToken,
} from "../middleware/useAccessToken.js";
// import { validateAuth } from "../middleware/useValidator.js";

const router = express.Router();

// Routes Auth
router.get("/", useAccessToken, GetAuth);
router.get("/:id", useAccessToken, GetAuthById);
router.post("/", PostAuth);
router.patch("/", useRefreshToken, RefreshSession);
router.delete("/", useAccessToken, DeleteAuth);

export default router;
