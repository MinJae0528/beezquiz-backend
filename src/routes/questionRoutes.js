// ✅ 완전히 정리된 questionRoutes.js
import express from "express";
import {
  saveQuestions,
  getQuestionsByRoom
} from "../controllers/questionController.js";

const router = express.Router();

router.post("/:roomCode/questions", saveQuestions);
router.get("/:roomCode/questions", getQuestionsByRoom);

export default router;
