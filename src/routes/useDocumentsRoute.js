import express from "express";
import {
  GetDocuments,
  PostDocuments,
  PatchDocuments,
  DeleteDocuments,
  GetDocumentsById,
  GetDocumentsByQuery,
} from "../controllers/useDocumentsController.js";

import { validateDocuments } from "../middleware/useValidator.js";
import uploadDokumen from "../middleware/useDicumentsMulter.js";
import { useAccessRole } from "../middleware/useAccessRole.js";

const router = express.Router();
const PATCH = process.env.BASE_ROUTE;

// Routes Documents
router.get("/", useAccessRole, GetDocuments);
router.get("/:id", useAccessRole, GetDocumentsById);
router.post("/", useAccessRole, uploadDokumen.single("file"), PostDocuments);
router.get(
  "/by/:tipe_dokumen/:tahun?/:id?",
  useAccessRole,
  GetDocumentsByQuery
);
router.patch(
  "/:id",
  useAccessRole,
  uploadDokumen.single("file"),
  PatchDocuments
);
router.delete("/:id", useAccessRole, DeleteDocuments);

export default router;
