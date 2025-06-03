import Room from "../models/Room.js";

// 결과 저장
export const saveResult = async (req, res) => {
  const { roomCode, nickname, answers, role } = req.body;

  if (!roomCode || !nickname || !Array.isArray(answers)) {
    return res.status(400).json({ error: "roomCode, nickname, answers 모두 필요합니다." });
  }

  if (role === "teacher") {
    return res.status(200).json({ success: false, message: "교사 응답은 저장되지 않습니다." });
  }

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ error: "해당 방이 없습니다." });
    }

    const correctAnswers = room.questions.map((q) => q.correct_answer.trim());

    const score = answers.reduce((acc, ans, idx) => {
      return acc + ((ans ?? "").trim() === correctAnswers[idx] ? 1 : 0);
    }, 0);

    room.participants.set(nickname, score);
    await room.save();

    return res.status(200).json({ success: true, score });
  } catch (err) {
    console.error("❌ saveResult 에러:", err);
    return res.status(500).json({ error: "결과 저장 중 오류" });
  }
};

// 결과 요약 조회
export const getRoomSummary = async (req, res) => {
  const { roomCode } = req.params;

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ message: "해당 방이 존재하지 않습니다." });
    }

    const participants = Array.from(room.participants.entries()).map(([nickname, score]) => ({
      nickname,
      score
    }));

    const scores = participants.map(p => p.score);
    const total = scores.length;
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const average = total > 0 ? totalScore / total : 0;

    return res.status(200).json({
      averageScore: average,
      totalQuestions: room.questions.length,
      participants
    });
  } catch (err) {
    console.error("❌ getRoomSummary 에러:", err);
    return res.status(500).json({ error: "결과 요약 조회 실패" });
  }
};