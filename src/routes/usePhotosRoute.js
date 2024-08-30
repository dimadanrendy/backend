import express from "express";
import {
  GetPhotos,
  PostPhotos,
  PatchPhotos,
  DeletePhotos,
  GetPhotosById,
} from "../controllers/usePhotosController.js";

const router = express.Router();

// Routes Photos
router.get("/", GetPhotos);
router.get("/:id", GetPhotosById);
router.post("/", PostPhotos);
router.patch("/:id", PatchPhotos);
router.delete("/:id", DeletePhotos);

export default router;
