import express from "express";
import {
  GetPhotos,
  PostPhotos,
  PatchPhotos,
  DeletePhotos,
  GetPhotosById,
} from "../controllers/usePhotosController.js";

import uploadFoto from "../middleware/useFotoMulter.js";
import { useAccessRole } from "../middleware/useAccessRole.js";

const router = express.Router();

// Routes Photos
router.get("/", useAccessRole, GetPhotos);
router.get("/:id", useAccessRole, GetPhotosById);
router.post("/", useAccessRole, uploadFoto.single("file"), PostPhotos);
router.patch("/:id", useAccessRole, uploadFoto.single("file"), PatchPhotos);
router.delete("/:id", useAccessRole, DeletePhotos);

export default router;
