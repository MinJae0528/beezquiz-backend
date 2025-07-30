// ✅ routes/roomRoutes.js
import express from "express";
import Room from "../models/Room.js";
import { nanoid } from "nanoid";

const router = express.Router();

// ✅ 방 생성 API
router.post("/create", async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "questions 배열이 필요합니다." });
    }

    const roomCode = nanoid(6).toUpperCase();
    const createdAt = new Date();

    // ✅ 모델 스키마에 맞게 필드명 수정
    const formattedQuestions = questions.map((q) => {
      const isObjective = q.type === "objective";

      return {
        text: q.text || "", // 모델 필드명 text
        correctAnswer: isObjective
          ? String(q.correctAnswer)
          : (q.correctAnswer || ""),
        type: isObjective ? "objective" : "subjective",
        options: isObjective
          ? (q.options || ["", "", "", ""]).map((opt) => opt.trim())
          : undefined,
      };
    });

    const newRoom = new Room({
      host: "비공개",
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
