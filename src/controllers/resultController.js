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

    // ✅ 알파벳(A~D) → 숫자 문자열(0~3)로 변환
    const convertAlphabetToIndex = (value) => {
      if (typeof value === 'string' && /^[A-D]$/.test(value.trim())) {
        return (value.trim().charCodeAt(0) - 65).toString(); // 'A' → '0'
      }
      return value?.trim(); // 그 외는 그대로
    };

    const score = answers.reduce((acc, ans, idx) => {
      const submitted = convertAlphabetToIndex(ans ?? "");
      const correct = correctAnswers[idx];
      return acc + (submitted === correct ? 1 : 0);
    }, 0);

    room.participants.set(nickname, score);
    await room.save();

    return res.status(200).json({ success: true, score });
  } catch (err) {
    console.error("❌ saveResult 에러:", err);
    return res.status(500).json({ error: "결과 저장 중 오류" });
  }
};
