// ✅ routes/questionRoutes.js
import express from "express";
import {
  saveQuestions,
  getQuestionsByRoom
} from "../controllers/questionController.js";

const router = express.Router();

// ✅ 문제 저장
router.post("/:roomCode/questions", saveQuestions);

// ✅ 문제 조회
router.get("/:roomCode/questions", getQuestionsByRoom);

export default router;
