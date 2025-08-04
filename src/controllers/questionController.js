// ✅ controllers/questionController.js
import Room from "../models/Room.js";

// ✅ 문제 저장 (객관식/서술형 모두 지원)
export const saveQuestions = async (req, res) => {
  const { roomCode } = req.params;
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: "questions 배열이 필요합니다." });
  }

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ message: "해당 방이 없습니다." });
    }

    // 기존 문제 삭제(중복 방지)
    room.questions = [];

    // 질문 저장 (type, options 포함)
    questions.forEach((q) => {
      if (q.text) {
        const newQ = {
          text: q.text,
          correctAnswer: (q.correctAnswer || "").trim(), // 객관식: "1", "2", "3", "4" / 서술형: 문자열
          type: q.type || "subjective",
        };

        // 객관식이면 options 필드 포함
        if (q.type === "objective") {
          newQ.options = (q.options || []).map(opt => opt.trim());
        }

        room.questions.push(newQ);
      }
    });

    await room.save();
    return res.status(200).json({ message: "문제 저장 성공" });
  } catch (err) {
    console.error("❌ saveQuestions 에러:", err);
    return res.status(500).json({ message: "문제 저장 중 오류" });
  }
};

// ✅ 문제 조회 (객관식/서술형 모두 지원)
export const getQuestionsByRoom = async (req, res) => {
  const { roomCode } = req.params;

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: "해당 방이 존재하지 않습니다." });
    }

    // questions 배열 반환 (type, options 포함)
    const questions = room.questions.map((q) => ({
      text: q.text,
      correctAnswer: q.correctAnswer,
      type: q.type || "subjective",
      options: Array.isArray(q.options) ? q.options : [],
    }));

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("❌ getQuestionsByRoom 에러:", err);
    return res.status(500).json({ message: "문제 불러오기 실패" });
  }
};
