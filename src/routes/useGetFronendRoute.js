import express from "express";
import {
  GetPhotosByQuery,
  GetPegawaiByQuery,
} from "../controllers/useGetFronendController.js";

const router = express.Router();

router.get("/by/:tipe/:bidang?", GetPhotosByQuery);
router.get("/pegawai/by/:status/:bidang?", GetPegawaiByQuery);

export default router;
