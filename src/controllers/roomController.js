import Room from "../models/Room.js";
import { nanoid } from "nanoid";

/**
 * 방 생성 API
 * [POST] /room/create
 */
export async function createRoom(req, res) {
  try {
    const { teacherName, questions } = req.body;

    if (!teacherName) {
      return res.status(400).json({ error: "teacherName is required" });
    }

    const roomCode = nanoid(6).toUpperCase();

    const newRoom = new Room({
      roomCode,
      host: teacherName,
      questions: questions?.map((q) => ({
        questionText: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })) || [],
    });

    await newRoom.save();
    return res.status(201).json({ roomCode });
  } catch (err) {
    console.error("방 생성 오류:", err);
    return res.status(500).json({ error: "방 생성 실패" });
  }
}
