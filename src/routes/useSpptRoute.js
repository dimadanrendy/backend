import express from "express";
import { HandleSppt } from "../controllers/useSpptController.js";

const router = express.Router();

// Routes Photos
router.get("/:nop", HandleSppt);

export default router;
