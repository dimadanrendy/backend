import express from "express";
import {
  GetUsers,
  PostUsers,
  PatchUsers,
  DeleteUsers,
  GetUsersById,
} from "../controllers/useUsersController.js";

import { validateUser } from "../middleware/useValidator.js";
import { useAccessRole } from "../middleware/useAccessRole.js";

const router = express.Router();

// Routes Users
router.get("/", useAccessRole, GetUsers);
router.get("/:id", useAccessRole, GetUsersById);
router.post("/", useAccessRole, validateUser, PostUsers);
router.patch("/:id", useAccessRole, PatchUsers);
router.delete("/:id", useAccessRole, DeleteUsers);

export default router;
