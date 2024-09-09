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

const router = express.Router();
const PATCH = process.env.BASE_ROUTE;

// Routes Documents
router.get("/", GetDocuments);
router.get("/:id", GetDocumentsById);
router.post(
  "/",

  uploadDokumen.single("file"),
  PostDocuments
);
router.patch("/:id", PatchDocuments);
router.delete("/:id", DeleteDocuments);

export default router;
