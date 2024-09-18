import express from "express";
import {
  GetVideos,
  PostVideos,
  PatchVideos,
  DeleteVideos,
  GetVideosById,
} from "../controllers/useVideosController.js";
import uploadVideos from "../middleware/useVideoMulter.js";

const router = express.Router();

// Routes Videos
router.get("/", GetVideos);
router.get("/:id", GetVideosById);
router.post("/", uploadVideos.single("file"), PostVideos);
router.patch("/:id", uploadVideos.single("file"), PatchVideos);
router.delete("/:id", DeleteVideos);

export default router;
