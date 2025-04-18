import express from "express";
import {
  saveQuestions,
  getQuestionsByRoom
} from "../controllers/questionController.js";

const router = express.Router();

// 문제 저장
router.post("/:code/questions", saveQuestions);

// 문제 조회
router.get("/:code/questions", getQuestionsByRoom);

export default router;
