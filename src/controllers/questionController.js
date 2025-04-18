// src/controllers/questionController.js
import pool from "../config/db.js";

/**
 * POST /room/:code/questions
 * body: { questions: [ { question, answer } ] }
 */
export const saveQuestions = async (req, res) => {
  const { code } = req.params;
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "questions 배열이 필요합니다." });
  }

  try {
    // 1) room_code → room_id 조회
    const [[room]] = await pool.query(
      `SELECT room_id FROM rooms WHERE room_code = ?`,
      [code]
    );
    if (!room) return res.status(404).json({ message: "존재하지 않는 방 코드입니다." });
    const roomId = room.room_id;

    // 2) questions 삽입
    const insertSQL = `
      INSERT INTO questions
        (room_id, question_text, options, correct_answer)
      VALUES (?, ?, ?, ?)
    `;
    for (const { question, answer } of questions) {
      await pool.query(
        insertSQL,
        [roomId, question, JSON.stringify([]), answer]
      );
    }

    return res.status(201).json({ message: "문제 저장 완료" });
  } catch (err) {
    console.error("❌ 문제 저장 에러:", err);
    return res.status(500).json({ message: "문제 저장 실패" });
  }
};

/**
 * GET /room/:code/questions
 */
export const getQuestionsByRoom = async (req, res) => {
  const { code } = req.params;

  try {
    // room_id 가져오기
    const [[room]] = await pool.query(
      `SELECT room_id FROM rooms WHERE room_code = ?`,
      [code]
    );
    if (!room) return res.status(404).json({ message: "존재하지 않는 방 코드입니다." });
    const roomId = room.room_id;

    // questions 조회
    const [rows] = await pool.query(
      `SELECT question_id,
              question_text   AS question,
              options,
              correct_answer  AS answer
       FROM questions
       WHERE room_id = ?
       ORDER BY question_id ASC`,
      [roomId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("❌ 문제 조회 에러:", err);
    return res.status(500).json({ message: "문제 조회 실패" });
  }
};
