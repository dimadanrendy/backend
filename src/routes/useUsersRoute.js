import express from "express";
import {
  GetUsers,
  PostUsers,
  PatchUsers,
  DeleteUsers,
  GetUsersById,
} from "../controllers/useUsersController.js";

import { validateUser } from "../middleware/useValidator.js";

const router = express.Router();

// Routes Users
router.get("/", GetUsers);
router.get("/:id", GetUsersById);
router.post("/", validateUser, PostUsers);
router.patch("/:id", PatchUsers);
router.delete("/:id", DeleteUsers);

export default router;
