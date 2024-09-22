import express from "express";
import {
  GetDocuments,
  PostDocuments,
  PatchDocuments,
  DeleteDocuments,
  GetDocumentsById,
} from "../controllers/useDocumentsController.js";

import { validateDocuments } from "../middleware/useValidator.js";
import uploadDokumen from "../middleware/useDicumentsMulter.js";
import { useAccessToken } from "../middleware/useAccessToken.js";

const router = express.Router();
const PATCH = process.env.BASE_ROUTE;

// Routes Documents
router.get("/", useAccessToken, GetDocuments);
router.get("/:id", useAccessToken, GetDocumentsById);
router.post("/", useAccessToken, uploadDokumen.single("file"), PostDocuments);
router.patch(
  "/:id",
  useAccessToken,
  uploadDokumen.single("file"),
  PatchDocuments
);
router.delete("/:id", useAccessToken, DeleteDocuments);

export default router;
