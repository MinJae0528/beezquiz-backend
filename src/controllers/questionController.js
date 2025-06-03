// controllers/questionController.js
import Room from "../models/Room.js"; // Room 모델 import

export const saveQuestions = async (req, res) => {
  const { roomCode } = req.params;
  const { questions } = req.body;

  // options 검사 대신 questions 배열만 확인
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: "questions 배열이 필요합니다." });
  }

  try {
    // 방이 있는지 확인
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ message: "해당 방이 없습니다." });
    }

    // text와 correctAnswer만 저장
    questions.forEach((q) => {
      room.questions.push({
        question_text: q.text,
        correct_answer: q.correctAnswer.trim(),
      });
    });

    await room.save();
    return res.status(200).json({ message: "문제 저장 성공" });
  } catch (err) {
    console.error("saveQuestions 에러:", err);
    return res.status(500).json({ message: "문제 저장 중 오류" });
  }
};

