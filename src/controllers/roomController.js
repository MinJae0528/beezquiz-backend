import db from "../config/db.js";
import { nanoid } from "nanoid";

export async function createRoom(req, res, next) {
  try {
    const { teacherName, questions } = req.body;
    if (!teacherName) return res.status(400).json({ error: "teacherName is required" });

    const code = nanoid(6).toUpperCase();
    const insertRoomQuery = "INSERT INTO rooms (room_code, host) VALUES (?, ?)";
    const [roomResult] = await db.query(insertRoomQuery, [code, teacherName]);
    const room_id = roomResult.insertId;

    if (questions && questions.length > 0) {
      const insertQuestionQuery = `
        INSERT INTO questions (room_id, question_text, options, correct_answer)
        VALUES ?
      `;
      const questionData = questions.map((q) => [
        room_id,
        q.text,
        JSON.stringify(q.options),
        q.correctAnswer,
      ]);
      await db.query(insertQuestionQuery, [questionData]);
    }

    return res.status(201).json({ room_code: code });
  } catch (err) {
    console.error("❌ 방 생성 오류:", err);
    return res.status(500).json({ error: "방 생성 실패" });
  }
}

export async function checkRoom(req, res, next) {
  try {
    const code = req.params.code;
    const query = "SELECT * FROM rooms WHERE room_code = ?";
    const [rows] = await db.query(query, [code]);
    if (rows.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.status(404).json({ exists: false });
    }
  } catch (err) {
    console.error("❌ 방 확인 오류:", err);
    return res.status(500).json({ error: "서버 오류" });
  }
}