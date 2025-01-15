import express from "express";
import {
  GetPhotosByQuery,
  GetPegawaiByQuery,
  GetDokumentsByQuery,
} from "../controllers/useGetFronendController.js";

const router = express.Router();

router.get("/by/:tipe/:bidang?", GetPhotosByQuery);
router.get("/pegawai/by/:status/:bidang?", GetPegawaiByQuery);
router.get("/documents/by/:tipe_dokumen/:tahun?/:id?", GetDokumentsByQuery);

export default router;
