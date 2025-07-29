// controllers/roomController.js
import Room from "../models/Room.js";
import { nanoid } from "nanoid";

// 방 생성 API
export async function createRoom(req, res) {
  try {
    const { teacherName, questions } = req.body;

    const roomCode = nanoid(6).toUpperCase();

    const newRoom = new Room({
      roomCode,
      host: teacherName || "비공개", // teacherName 없어도 OK
      questions: questions?.map((q) => ({
        text: q.text,
        correctAnswer: q.correctAnswer,
        type: q.type || "subjective",
        options: q.options?.length ? q.options : undefined,
      })) || [],
    });

    await newRoom.save();
    return res.status(201).json({ roomCode });
  } catch (err) {
    console.error("방 생성 오류:", err);
    return res.status(500).json({ error: "방 생성 실패" });
  }
}
