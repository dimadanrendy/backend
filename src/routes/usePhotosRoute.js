import express from "express";
import {
  GetPhotos,
  PostPhotos,
  PatchPhotos,
  DeletePhotos,
  GetPhotosById,
} from "../controllers/usePhotosController.js";

import uploadFoto from "../middleware/useFotoMulter.js";
import { useAccessToken } from "../middleware/useAccessToken.js";

const router = express.Router();

// Routes Photos
router.get("/", useAccessToken, GetPhotos);
router.get("/:id", useAccessToken, GetPhotosById);
router.post("/", useAccessToken, uploadFoto.single("file"), PostPhotos);
router.patch("/:id", useAccessToken, uploadFoto.single("file"), PatchPhotos);
router.delete("/:id", useAccessToken, DeletePhotos);

export default router;
