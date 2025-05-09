// ✅ src/controllers/roomController.js
import db from "../config/db.js";
import { nanoid } from "nanoid";

/**
 * 방 생성 API
 * [POST] /room/create
 */
export async function createRoom(req, res, next) {
  try {
    const { teacherName, questions } = req.body;

    if (!teacherName) {
      return res.status(400).json({ error: "teacherName is required" });
    }

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
    console.error("방 생성 오류:", err);
    return res.status(500).json({ error: "방 생성 실패" });
  }
}

/**
 * 방 존재 여부 확인 API
 */
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
    console.error("방 확인 오류:", err);
    return res.status(500).json({ error: "서버 오류" });
  }
}

/**
 * 퀴즈 결과 요약 API
 * [GET] /room/:roomCode/summary
 */
export async function getRoomSummary(req, res) {
  const { roomCode } = req.params;

  try {
    const [roomRows] = await db.query(
      `SELECT room_id, host FROM rooms WHERE room_code = ?`,
      [roomCode]
    );
    if (roomRows.length === 0) {
      return res.status(404).json({ message: "해당 방이 존재하지 않습니다." });
    }

    const roomId = roomRows[0].room_id;
    const host = roomRows[0].host;

    const [resultRows] = await db.query(
      `SELECT nickname, score FROM results WHERE room_id = ? AND nickname != ?`,
      [roomId, host]
    );

    const total = resultRows.length;
    const totalScore = resultRows.reduce((sum, row) => sum + row.score, 0);
    const average = total > 0 ? totalScore / total : 0;

    return res.status(200).json({
      averageScore: average,
      participants: resultRows,
    });
  } catch (err) {
    console.error("요약 조회 오류:", err);
    return res.status(500).json({ error: "서버 오류" });
  }
}
