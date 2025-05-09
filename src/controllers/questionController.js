// ✅ src/controllers/questionController.js
import db from "../config/db.js";

// 문제 저장
export async function saveQuestions(req, res) {
  const { roomCode } = req.params;
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "questions 배열이 필요합니다." });
  }

  try {
    const [rooms] = await db.query(
      "SELECT room_id FROM rooms WHERE room_code = ?",
      [roomCode]
    );
    if (rooms.length === 0) {
      return res.status(404).json({ error: "해당 방이 존재하지 않습니다." });
    }
    const roomId = rooms[0].room_id;

    // 유효성 검사 추가
    const validQuestions = questions.filter((q) =>
      q.text && q.options && q.correctAnswer
    );

    if (validQuestions.length === 0) {
      return res.status(400).json({ error: "모든 문제에 text, options, correctAnswer가 필요합니다." });
    }

    const values = validQuestions.map((q) => [
      roomId,
      q.text,
      JSON.stringify(q.options),
      q.correctAnswer,
    ]);

    await db.query(
      `INSERT INTO questions (room_id, question_text, options, correct_answer)
       VALUES ?`,
      [values]
    );

    return res.status(201).json({ message: "문제 저장 완료" });
  } catch (err) {
    console.error("saveQuestions 에러:", err);
    return res.status(500).json({ error: "문제 저장 중 오류 발생" });
  }
}

// 문제 조회
export async function getQuestionsByRoom(req, res) {
  const { roomCode } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT question_text, options, correct_answer
       FROM questions
       WHERE room_id = (
         SELECT room_id FROM rooms WHERE room_code = ?
       )
       ORDER BY question_id ASC`,
      [roomCode]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("getQuestionsByRoom 에러:", err);
    return res.status(500).json({ error: "문제 불러오기 실패" });
  }
}