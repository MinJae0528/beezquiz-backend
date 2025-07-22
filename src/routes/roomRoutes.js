// ✅ routes/roomRoutes.js
import express from "express";
import Room from "../models/Room.js";
import { nanoid } from "nanoid";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "questions 배열이 필요합니다." });
    }

    const roomCode = nanoid(6).toUpperCase();
    const createdAt = new Date();

    const formattedQuestions = questions.map((q) => ({
      question_text: q.text || "",
      correct_answer: q.correctAnswer || "",
      type: q.type || "subjective",
      options: q.type === "objective" ? (q.options || []).filter(opt => opt.trim()) : undefined
    }));

    const newRoom = new Room({
      host: "default",
      roomCode,
      createdAt,
      questions: formattedQuestions,
      participants: new Map(),
      nicknames: [],
    });

    await newRoom.save();
    return res.status(201).json({ roomCode });
  } catch (err) {
    console.error("🔥 방 생성 오류:", err);
    return res.status(500).json({ message: "방 생성 실패" });
  }
});

export default router;
