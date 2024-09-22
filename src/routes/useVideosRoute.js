import express from "express";
import {
  GetVideos,
  PostVideos,
  PatchVideos,
  DeleteVideos,
  GetVideosById,
} from "../controllers/useVideosController.js";
import uploadVideos from "../middleware/useVideoMulter.js";
import { useAccessRole } from "../middleware/useAccessRole.js";

const router = express.Router();

// Routes Videos
router.get("/", useAccessRole, GetVideos);
router.get("/:id", useAccessRole, GetVideosById);
router.post("/", useAccessRole, uploadVideos.single("file"), PostVideos);
router.patch("/:id", useAccessRole, uploadVideos.single("file"), PatchVideos);
router.delete("/:id", useAccessRole, DeleteVideos);

export default router;
