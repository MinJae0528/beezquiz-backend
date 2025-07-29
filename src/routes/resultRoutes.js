// ✅ routes/resultRoutes.js
import express from "express";
import {
  saveResult,
  getRoomSummary,
} from "../controllers/resultController.js";

const router = express.Router();

// ✅ 퀴즈 결과 저장
router.post("/", saveResult);

// ✅ 결과 요약 조회
router.get("/summary/:roomCode", getRoomSummary);

export default router;
