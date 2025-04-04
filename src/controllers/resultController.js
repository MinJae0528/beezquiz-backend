// src/controllers/resultController.js

// DB 연결 객체 import
import db from "../config/db.js";

/**
 * [자동 채점 + 결과 저장 API]
 * 사용자가 제출한 답안을 받아 정답과 비교해 점수를 계산하고,
 * DB에 결과(nickname, score, 시간)를 저장하는 함수입니다.
 */
export function saveResult(req, res) {
  const { room_id, nickname, answers } = req.body; // 요청에서 데이터 추출

  // 1️. 해당 room_id의 문제들의 정답 목록 조회
  const getAnswersQuery = `
    SELECT correct_answer 
    FROM questions 
    WHERE room_id = ?
    ORDER BY question_id ASC
  `;

  db.query(getAnswersQuery, [room_id], (err, results) => {
    if (err) {
      console.error("❌ 정답 불러오기 오류:", err);
      return res.status(500).json({ error: "정답 조회 실패" });
    }

    // 2️. 정답 리스트만 추출
    const correctAnswers = results.map((row) => row.correct_answer);

    // 3️. 사용자 답안과 정답 비교 → 점수 계산
    let score = 0;
    for (let i = 0; i < correctAnswers.length; i++) {
      const userAnswer = answers[i]?.trim?.();        // 사용자의 i번째 답안 (공백 제거)
      const correct = correctAnswers[i]?.trim?.();    // 정답 (공백 제거)

      if (userAnswer === correct) {
        score++; // 정답이면 점수 1점 추가
      }
    }

    // 4️. 계산된 점수와 닉네임을 results 테이블에 저장
    const insertResultQuery = `
      INSERT INTO results (room_id, nickname, score, completed_at)
      VALUES (?, ?, ?, NOW())
    `;

    db.query(insertResultQuery, [room_id, nickname, score], (err2) => {
      if (err2) {
        console.error("❌ 결과 저장 실패:", err2);
        return res.status(500).json({ error: "결과 저장 실패" });
      }

      // 5️. 성공 응답: 점수 포함해서 클라이언트에 전송
      res.status(200).json({ success: true, score });
    });
  });
}

/**
 * [결과 목록 조회 API]
 * 특정 방(room_id)의 참가자 닉네임, 점수, 제출 시간 정보를 조회합니다.
 * 선생님 화면에서 통계/결과 확인용으로 사용됩니다.
 */
export function getResultsByRoom(req, res) {
  const room_id = req.params.room_id;

  const query = `
    SELECT nickname, score, completed_at 
    FROM results 
    WHERE room_id = ?
  `;

  db.query(query, [room_id], (err, results) => {
    if (err) {
      console.error("❌ 결과 조회 실패:", err);
      return res.status(500).json({ error: "결과 조회 실패" });
    }

    // 결과 배열을 그대로 클라이언트에 응답
    res.status(200).json(results);
  });
}
