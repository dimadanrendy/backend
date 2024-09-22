import express from "express";
import {
  GetAuth,
  PostAuth,
  DeleteAuth,
  GetAuthById,
  RefreshSession,
} from "../controllers/useAuthController.js";
import { useAccessToken } from "../middleware/useAccessToken.js";
// import { validateAuth } from "../middleware/useValidator.js";

const router = express.Router();

// Routes Auth
router.get("/", useAccessToken, GetAuth);
router.get("/:id", useAccessToken, GetAuthById);
router.post("/", PostAuth);
router.patch("/:userId", RefreshSession);
router.delete("/:id", useAccessToken, DeleteAuth);

export default router;
