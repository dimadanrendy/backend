import express from "express";
import {
  HandleFileDocument,
  HandleFileGambar,
  HandleFileVideo,
  HandleFileGambarPegawai,
} from "../controllers/useHandleFileController.js";
import { useAccessToken } from "../middleware/useAccessToken.js";

const router = express.Router();

router.get("/image/:filename", HandleFileGambar);
router.get("/image-pegawai/:filename", HandleFileGambarPegawai);
router.get("/document/:filename", HandleFileDocument);
router.get("/video/:filename", useAccessToken, HandleFileVideo);

export default router;
