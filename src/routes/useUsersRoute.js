import express from "express";
import {
  GetUsers,
  PostUsers,
  PatchUsers,
  DeleteUsers,
  GetUsersById,
} from "../controllers/useUsersController.js";

const router = express.Router();

// Routes Users
router.get("/", GetUsers);
router.get("/:id", GetUsersById);
router.post("/", PostUsers);
router.patch("/:id", PatchUsers);
router.delete("/:id", DeleteUsers);

export default router;
