import express from "express";
import {
  GetDocuments,
  PostDocuments,
  PatchDocuments,
  DeleteDocuments,
  GetDocumentsById,
} from "../controllers/useDocumentsController.js";

const router = express.Router();
const PATCH = process.env.BASE_ROUTE;

// Routes Documents
router.get("/", GetDocuments);
router.get("/:id", GetDocumentsById);
router.post("/", PostDocuments);
router.patch("/:id", PatchDocuments);
router.delete("/:id", DeleteDocuments);

export default router;
