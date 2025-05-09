import express from "express";
import {
  saveResult,
  getRoomSummary,
} from "../controllers/resultController.js";

const router = express.Router();

router.post("/", saveResult);
router.get("/summary/:roomCode", getRoomSummary);

export default router;
