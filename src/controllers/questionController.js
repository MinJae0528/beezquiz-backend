// controllers/questionController.js
import Room from "../models/Room.js"; // Room 모델 import

// ✅ 문제 저장
export const saveQuestions = async (req, res) => {
  const { roomCode } = req.params;
  const { questions } = req.body;

  // 유효성 검사
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: "questions 배열이 필요합니다." });
  }

  try {
    // 방 존재 여부 확인
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ message: "해당 방이 없습니다." });
    }

    // 질문 저장 (question_text와 correct_answer만)
    questions.forEach((q) => {
      if (q.text && q.correctAnswer) {
        room.questions.push({
          question_text: q.text,
          correct_answer: q.correctAnswer.trim(),
        });
      }
    });

    await room.save();
    return res.status(200).json({ message: "문제 저장 성공" });
  } catch (err) {
    console.error("saveQuestions 에러:", err);
    return res.status(500).json({ message: "문제 저장 중 오류" });
  }
};

// ✅ 문제 조회
export const getQuestionsByRoom = async (req, res) => {
  const { roomCode } = req.params;

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: "해당 방이 존재하지 않습니다." });
    }

    // questions 배열 반환
    const questions = room.questions.map((q) => ({
      question: q.question_text,
      answer: q.correct_answer,
    }));

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("getQuestionsByRoom 에러:", err);
    return res.status(500).json({ message: "문제 불러오기 실패" });
  }
};
