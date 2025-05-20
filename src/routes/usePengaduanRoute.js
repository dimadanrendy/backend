import express from "express";
import {
  PostPengaduan,
  GetStatusPengaduan,
  GetAllPengaduan,
} from "../controllers/usePengaduanController.js";

import { useAccessRole } from "../middleware/useAccessRole.js";
import uploadPengaduan from "../middleware/usePengaduanMulter.js";

const router = express.Router();
const PATCH = process.env.BASE_ROUTE;

// Routes Pengaduan

router.post("/baru", uploadPengaduan.single("lampiran"), PostPengaduan);
router.get("/status/:no_pengaduan", GetStatusPengaduan);
router.get("/all", useAccessRole, GetAllPengaduan);

export default router;
