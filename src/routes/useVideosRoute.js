import express from "express";
import {
  GetVideos,
  PostVideos,
  PatchVideos,
  DeleteVideos,
  GetVideosById,
} from "../controllers/useVideosController.js";

import { validateVideos } from "../middleware/useValidator.js";

const router = express.Router();

// Routes Videos
router.get("/", GetVideos);
router.get("/:id", GetVideosById);
router.post("/", PostVideos);
router.patch("/:id", PatchVideos);
router.delete("/:id", DeleteVideos);

export default router;
