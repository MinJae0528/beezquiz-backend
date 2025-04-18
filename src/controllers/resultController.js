// src/controllers/resultController.js
import db from "../config/db.js";

/**
 * POST /results
 * body: { room_id, nickname, answers: [String] }
 */
export const saveResult = async (req, res) => {
  const { room_id, nickname, answers } = req.body;
  if (!room_id || !nickname || !Array.isArray(answers)) {
    return res.status(400).json({ error: "room_id, nickname, answers 모두 필요합니다." });
  }

  try {
    // 1) 정답 불러오기
    const getAnswersQuery = `
      SELECT correct_answer
      FROM questions
      WHERE room_id = ?
      ORDER BY question_id ASC
    `;
    const [rows] = await db.query(getAnswersQuery, [room_id]);
    const correctAnswers = rows.map(r => r.correct_answer.trim());

    // 2) 채점
    let score = 0;
    correctAnswers.forEach((ans, i) => {
      if (answers[i]?.trim() === ans) score++;
    });

    // 3) 결과 저장
    const insertResultQuery = `
      INSERT INTO results (room_id, nickname, score, completed_at)
      VALUES (?, ?, ?, NOW())
    `;
    await db.query(insertResultQuery, [room_id, nickname, score]);

    return res.status(200).json({ success: true, score });
  } catch (err) {
    console.error("❌ saveResult 에러:", err);
    return res.status(500).json({ error: "결과 저장 중 오류가 발생했습니다." });
  }
};

/**
 * GET /results/room/:room_id
 */
export const getResultsByRoom = async (req, res) => {
  const { room_id } = req.params;

  try {
    const query = `
      SELECT nickname, score, completed_at
      FROM results
      WHERE room_id = ?
      ORDER BY completed_at DESC
    `;
    const [rows] = await db.query(query, [room_id]);
    return res.status(200).json(rows);
  } catch (err) {
    console.error("❌ getResultsByRoom 에러:", err);
    return res.status(500).json({ error: "결과 조회 중 오류가 발생했습니다." });
  }
};
