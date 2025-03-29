// src/controllers/questionController.js

// DB 연결 객체 import
import db from "../confing/db.js";

/**
 * [문제 목록 조회 함수]
 * 특정 방 코드(roomCode)에 해당하는 문제 목록을 조회하는 API
 * → 프론트에서 퀴즈 시작 시 사용
 */
export function getQuestionsByRoom(req, res) {
  const roomCode = req.params.code; // URL에서 받은 roomCode (예: /room/6QR4L2/questions)

  // 1️. 해당 방(room_code)의 room_id를 조회
  const getRoomIdQuery = `
    SELECT room_id FROM rooms WHERE room_code = ?
  `;

  db.query(getRoomIdQuery, [roomCode], (err, roomResults) => {
    if (err || roomResults.length === 0) {
      console.error("❌ 방 조회 실패 또는 존재하지 않음:", err);
      return res.status(404).json({ error: "존재하지 않는 방입니다." });
    }

    const roomId = roomResults[0].room_id;

    // 2️. 해당 room_id의 문제 목록 조회
    const getQuestionsQuery = `
      SELECT question_text, options FROM questions WHERE room_id = ?
    `;

    db.query(getQuestionsQuery, [roomId], (err2, results) => {
      if (err2) {
        console.error("❌ 문제 조회 실패:", err2);
        return res.status(500).json({ error: "문제 불러오기 실패" });
      }

      // 3️. 결과를 클라이언트가 쓰기 쉬운 형태로 가공
      const questions = results.map((q) => ({
        text: q.question_text,
        options: JSON.parse(q.options), // 문자열로 저장된 JSON 배열을 객체로 변환
      }));

      res.status(200).json({ questions }); // 결과 전송
    });
  });
}
