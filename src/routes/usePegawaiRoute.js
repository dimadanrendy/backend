import express from "express";
import {
  DeletePhotos,
  GetPhotos,
  PatchPhotos,
  PostPhotos,
  GetPhotosById,
  GetPhotosByQuery,
} from "../controllers/usePegawaiController.js";

import { useAccessRole } from "../middleware/useAccessRole.js";
import uploadFotoPegawai from "../middleware/usePegawaiMulter.js";

const router = express.Router();
const PATCH = process.env.BASE_ROUTE;

// Routes Documents
router.get("/", useAccessRole, GetPhotos);
router.get("/:id", useAccessRole, GetPhotosById);
router.get("/by/:status/:bidang?", useAccessRole, GetPhotosByQuery);
router.post("/", useAccessRole, uploadFotoPegawai.single("image"), PostPhotos);
router.patch(
  "/:id",
  useAccessRole,
  uploadFotoPegawai.single("image"),
  PatchPhotos
);
router.delete("/:id", useAccessRole, DeletePhotos);

export default router;
