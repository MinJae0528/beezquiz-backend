// src/controllers/questionController.js

import db from "../config/db.js";

/**
 * [문제 목록 조회 함수]
 * 특정 방 코드(roomCode)에 해당하는 문제 목록을 조회하는 API
 * → 프론트에서 퀴즈 시작 시 사용
 */
export function getQuestionsByRoom(req, res) {
  const roomCode = req.params.code;

  // 1️⃣ room_code로 해당 방의 room_id 조회
  const getRoomIdQuery = `
    SELECT room_id FROM rooms WHERE room_code = ?
  `;

  db.query(getRoomIdQuery, [roomCode], (err, roomResults) => {
    if (err || roomResults.length === 0) {
      console.error("❌ 방 조회 실패 또는 존재하지 않음:", err);
      return res.status(404).json({ error: "존재하지 않는 방입니다." });
    }

    const roomId = roomResults[0].room_id;

    // 2️⃣ 해당 room_id의 문제 목록 조회
    const getQuestionsQuery = `
      SELECT question_text, options FROM questions WHERE room_id = ?
    `;

    db.query(getQuestionsQuery, [roomId], (err2, results) => {
      if (err2) {
        console.error("❌ 문제 조회 실패:", err2);
        return res.status(500).json({ error: "문제 불러오기 실패" });
      }

      // 3️⃣ 보기 배열을 안전하게 파싱해서 반환
      const questions = results.map((q) => {
        let parsedOptions = [];

        try {
          parsedOptions = typeof q.options === "string"
            ? JSON.parse(q.options)
            : q.options;
        } catch (e) {
          console.error("❌ 보기 파싱 오류:", q.options);
          parsedOptions = [];
        }

        return {
          text: q.question_text,
          options: parsedOptions
        };
      });

      res.status(200).json({ questions });
    });
  });
}
