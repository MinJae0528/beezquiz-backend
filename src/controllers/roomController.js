// src/controllers/roomController.js

import db from "../config/db.js";
import { nanoid } from "nanoid";

/**
 * 방 생성 API
 * [POST] /room/create
 * 요청 body: { teacherName, questions }
 * - teacherName: 방 생성자 이름
 * - questions: 문제 배열 (선택)
 * 
 * 1. 6자리 랜덤 방 코드 생성
 * 2. rooms 테이블에 방 정보 저장
 * 3. 전달된 문제 배열이 있다면 questions 테이블에 저장
 */
export async function createRoom(req, res, next) {
  try {
    const { teacherName, questions } = req.body;

    if (!teacherName) {
      return res.status(400).json({ error: "teacherName is required" });
    }

    // 랜덤 방 코드 생성
    const code = nanoid(6).toUpperCase();

    // 방 정보 저장
    const insertRoomQuery = "INSERT INTO rooms (room_code, host) VALUES (?, ?)";
    const [roomResult] = await db.query(insertRoomQuery, [code, teacherName]);
    const room_id = roomResult.insertId;

    // 문제 저장 (선택적)
    if (questions && questions.length > 0) {
      const insertQuestionQuery = `
        INSERT INTO questions (room_id, question_text, options, correct_answer)
        VALUES ?
      `;
      const questionData = questions.map((q) => [
        room_id,
        q.text,
        JSON.stringify(q.options),
        q.correctAnswer,
      ]);
      await db.query(insertQuestionQuery, [questionData]);
    }

    return res.status(201).json({ room_code: code });
  } catch (err) {
    console.error("방 생성 오류:", err);
    return res.status(500).json({ error: "방 생성 실패" });
  }
}

/**
 * 방 존재 여부 확인 API
 * [GET] /room/:code
 * - 주어진 room_code가 DB에 존재하는지 확인
 * - 존재 여부만 Boolean으로 응답
 */
export async function checkRoom(req, res, next) {
  try {
    const code = req.params.code;
    const query = "SELECT * FROM rooms WHERE room_code = ?";
    const [rows] = await db.query(query, [code]);

    if (rows.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.status(404).json({ exists: false });
    }
  } catch (err) {
    console.error("방 확인 오류:", err);
    return res.status(500).json({ error: "서버 오류" });
  }
}
