// src/controllers/roomController.js

// DB 연결 객체 불러오기
import db from "../confing/db.js";

// 방 코드 생성에 사용할 nanoid 라이브러리
import { nanoid } from "nanoid";

/**
 * [방 생성 API]
 * - 선생님의 이름과 문제 리스트를 받아서
 * - rooms 테이블에 방 정보 저장
 * - questions 테이블에 문제 목록 저장
 */
export function createRoom(req, res) {
  const { teacherName, questions } = req.body;

  // 1️. 6자리 랜덤 방 코드 생성 (예: "ABC123")
  const code = nanoid(6).toUpperCase();

  // 2️. 방 정보 DB에 저장
  const insertRoomQuery = "INSERT INTO rooms (room_code, host) VALUES (?, ?)";
  db.query(insertRoomQuery, [code, teacherName], (err, result) => {
    if (err) {
      console.error("❌ 방 생성 오류:", err);
      return res.status(500).json({ error: "방 생성 실패" });
    }

    const room_id = result.insertId; // 생성된 room의 PK 값

    // 3️. 문제들을 question 테이블에 일괄 삽입 (Bulk Insert)
    const insertQuestionQuery = `
      INSERT INTO questions (room_id, question_text, options, correct_answer)
      VALUES ?
    `;

    // 4️. 질문 데이터 구성 (문항, 보기, 정답)
    const questionData = questions.map((q) => [
      room_id,
      q.text,
      JSON.stringify(q.options),  // 보기 배열을 문자열로 저장
      q.correctAnswer
    ]);

    db.query(insertQuestionQuery, [questionData], (err2) => {
      if (err2) {
        console.error("❌ 문제 등록 오류:", err2);
        return res.status(500).json({ error: "문제 저장 실패" });
      }

      // 5️. 모든 저장 완료 시, 방 코드 응답
      res.status(201).json({ room_code: code });
    });
  });
}

/**
 * [방 존재 여부 확인 API]
 * - 사용자가 입력한 방 코드가 실제로 존재하는지 확인
 * - 존재하면 exists: true, 없으면 false 반환
 */
export function checkRoom(req, res) {
  const code = req.params.code; // URL에서 받은 방 코드

  const query = "SELECT * FROM rooms WHERE room_code = ?";
  db.query(query, [code], (err, results) => {
    if (err) {
      console.error("❌ 방 확인 오류:", err);
      return res.status(500).json({ error: "서버 오류" });
    }

    // 존재 여부에 따라 응답
    if (results.length > 0) {
      res.json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  });
}
