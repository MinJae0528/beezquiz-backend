// src/controllers/resultController.js
import db from "../config/db.js";

/**
 * 결과 저장 API
 * [POST] /results
 * 요청 body: { room_id, nickname, answers: [String] }
 * - 해당 방의 정답과 유저 응답을 비교하여 자동 채점
 * - score를 계산해서 DB의 results 테이블에 저장
 */
export const saveResult = async (req, res) => {
  const { room_id, nickname, answers } = req.body;

  // 유효성 검사
  if (!room_id || !nickname || !Array.isArray(answers)) {
    return res.status(400).json({ error: "room_id, nickname, answers 모두 필요합니다." });
  }

  try {
    // 1. 해당 room_id의 정답 리스트 조회
    const getAnswersQuery = `
      SELECT correct_answer
      FROM questions
      WHERE room_id = ?
      ORDER BY question_id ASC
    `;
    const [rows] = await db.query(getAnswersQuery, [room_id]);
    const correctAnswers = rows.map(r => r.correct_answer.trim());

    // 2. 채점 진행
    let score = 0;
    correctAnswers.forEach((ans, i) => {
      if (answers[i]?.trim() === ans) score++;
    });

    // 3. results 테이블에 점수 저장
    const insertResultQuery = `
      INSERT INTO results (room_id, nickname, score, completed_at)
      VALUES (?, ?, ?, NOW())
    `;
    await db.query(insertResultQuery, [room_id, nickname, score]);

    return res.status(200).json({ success: true, score });
  } catch (err) {
    console.error("saveResult 에러:", err);
    return res.status(500).json({ error: "결과 저장 중 오류가 발생했습니다." });
  }
};

/**
 * 결과 조회 API
 * [GET] /results/room/:room_id
 * - 특정 room_id에 대한 유저들의 점수 목록을 조회
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
    console.error("getResultsByRoom 에러:", err);
    return res.status(500).json({ error: "결과 조회 중 오류가 발생했습니다." });
  }
};
