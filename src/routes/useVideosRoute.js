import express from "express";
import {
  GetVideos,
  PostVideos,
  PatchVideos,
  DeleteVideos,
  GetVideosById,
} from "../controllers/useVideosController.js";
import uploadVideos from "../middleware/useVideoMulter.js";
import { useAccessToken } from "../middleware/useAccessToken.js";

const router = express.Router();

// Routes Videos
router.get("/", useAccessToken, GetVideos);
router.get("/:id", useAccessToken, GetVideosById);
router.post("/", useAccessToken, uploadVideos.single("file"), PostVideos);
router.patch("/:id", useAccessToken, uploadVideos.single("file"), PatchVideos);
router.delete("/:id", useAccessToken, DeleteVideos);

export default router;
