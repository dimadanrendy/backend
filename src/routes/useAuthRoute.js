import express from "express";
import {
  GetAuth,
  PostAuth,
  PatchAuth,
  DeleteAuth,
  GetAuthById,
} from "../controllers/useAuthController.js";

const router = express.Router();

// Routes Auth
router.get("/", GetAuth);
router.get("/:id", GetAuthById);
router.post("/", PostAuth);
router.patch("/:id", PatchAuth);
router.delete("/:id", DeleteAuth);

export default router;
