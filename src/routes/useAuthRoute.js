import express from "express";
import {
  GetAuth,
  PostAuth,
  DeleteAuth,
  GetAuthById,
  RefreshSession,
} from "../controllers/useAuthController.js";
// import { validateAuth } from "../middleware/useValidator.js";

const router = express.Router();

// Routes Auth
router.get("/", GetAuth);
router.get("/:id", GetAuthById);
router.post("/", PostAuth);
router.patch("/:refresh_session", RefreshSession);
router.delete("/:id", DeleteAuth);

export default router;
