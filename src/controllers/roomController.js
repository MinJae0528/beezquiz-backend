// ✅ controllers/roomController.js
import Room from "../models/Room.js";
import { nanoid } from "nanoid";

// 방 생성 API (라우터에서 사용 가능)
export async function createRoom(req, res) {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "questions 배열이 필요합니다." });
    }

    const roomCode = nanoid(6).toUpperCase();
    const createdAt = new Date();

    const formattedQuestions = questions.map((q) => {
      const isObjective = q.type === "objective";

      return {
        text: q.text || "",
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
}
