import db from "../config/db.js";

export const saveResult = async (req, res) => {
  const { roomCode, nickname, answers, role } = req.body;

  if (!roomCode || !nickname || !Array.isArray(answers)) {
    return res.status(400).json({ error: "roomCode, nickname, answers 모두 필요합니다." });
  }

  if (role === "teacher") {
    return res.status(200).json({ success: false, message: "교사 응답은 저장되지 않습니다." });
  }

  try {
    const [rooms] = await db.query("SELECT room_id FROM rooms WHERE room_code = ?", [roomCode]);
    if (rooms.length === 0) return res.status(404).json({ error: "해당 방 없음" });

    const roomId = rooms[0].room_id;

    const [qs] = await db.query(
      "SELECT correct_answer FROM questions WHERE room_id = ? ORDER BY question_id ASC",
      [roomId]
    );
    const correctAnswers = qs.map((q) => q.correct_answer.trim());

    const score = answers.reduce((acc, ans, i) => {
      return acc + ((ans ?? "").trim() === correctAnswers[i] ? 1 : 0);
    }, 0);

    await db.query(
      `INSERT INTO results (room_id, nickname, score, completed_at)
       VALUES (?, ?, ?, NOW())`,
      [roomId, nickname, score]
    );

    return res.status(200).json({ success: true, score });
  } catch (err) {
    console.error("saveResult 에러:", err);
    return res.status(500).json({ error: "결과 저장 중 오류" });
  }
};

export const getRoomSummary = async (req, res) => {
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

    const totalScore = resultRows.reduce((sum, row) => sum + row.score, 0);
    const average = resultRows.length > 0 ? totalScore / resultRows.length : 0;

    return res.status(200).json({
      averageScore: average,
      participants: resultRows,
    });
  } catch (err) {
    console.error("getRoomSummary 에러:", err);
    return res.status(500).json({ error: "결과 요약 조회 실패" });
  }
};
