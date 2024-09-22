import express from "express";
import {
  HandleFileDocument,
  HandleFileGambar,
  HandleFileVideo,
} from "../controllers/useHandleFileController.js";
import { useAccessToken } from "../middleware/useAccessToken.js";

const router = express.Router();

router.get("/image/:filename", HandleFileGambar);
router.get("/document/:filename", useAccessToken, HandleFileDocument);
router.get("/video/:filename", useAccessToken, HandleFileVideo);

export default router;
