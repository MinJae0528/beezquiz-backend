// src/routes/roomRoutes.js

import express from "express";
import pool from "../config/db.js";               // MySQL 풀
import { randomBytes } from "crypto";             // 코드 생성용
const router = express.Router();

const participantCounts = {};   // in-memory 참가자 수
const nicknamesInRoom = new Map();
const roomTimestamps = new Map();
const ROOM_EXPIRE_TIME = 10 * 60 * 1000;  // 1시간

// 방 생성
router.post("/create", async (req, res) => {
  try {
    const { host } = req.body;
    if (!host) return res.status(400).json({ message: "host 값이 없습니다." });

    // 6자리 랜덤 코드
    const roomCode = randomBytes(3).toString("hex").toUpperCase();

    const createdAt = new Date();
    // 1) 메모리 초기화
    participantCounts[roomCode] = 0;
    nicknamesInRoom.set(roomCode, new Set());
    roomTimestamps.set(roomCode, Date.now());

    // 2) DB에 저장
    const sql = `INSERT INTO rooms (host, room_code, created_at) VALUES (?, ?, ?)`;
    await pool.query(sql, [host, roomCode, createdAt]);

    return res.status(200).json({ roomCode });
  } catch (error) {
    console.error("❌ 방 생성 오류:", error);
    return res.status(500).json({ message: "방 생성 실패" });
  }
});

// 방 참가
router.post("/join", async (req, res) => {
  try {
    const { roomCode, nickname } = req.body;
    if (!roomCode || !nickname) return res.status(400).json({ message: "roomCode나 nickname이 없습니다." });

    // 1) 만료 확인
    const ts = roomTimestamps.get(roomCode);
    if (!ts || Date.now() - ts > ROOM_EXPIRE_TIME) {
      cleanupRoom(roomCode);
      return res.status(410).json({ message: "방이 만료되었습니다." });
    }

    // 2) 중복 닉네임 체크
    const nameSet = nicknamesInRoom.get(roomCode) || new Set();
    if (nameSet.has(nickname)) {
      return res.status(400).json({ message: "이미 사용 중인 닉네임입니다." });
    }
    nameSet.add(nickname);
    nicknamesInRoom.set(roomCode, nameSet);

    // 3) 참가자 수 증가 (메모리)
    participantCounts[roomCode] = (participantCounts[roomCode] || 0) + 1;

    // 4) DB에 참가자 수 업데이트 (optional)
    // rooms 테이블에 participant_count 컬럼이 있다면:
    // await pool.query(
    //   `UPDATE rooms SET participant_count = ? WHERE room_code = ?`,
    //   [participantCounts[roomCode], roomCode]
    // );

    console.log(`✅ ${roomCode} 참가자 수:`, participantCounts[roomCode]);
    return res.status(200).json({
      message: "참가 성공",
      participantCount: participantCounts[roomCode],
    });
  } catch (error) {
    console.error("❌ 방 참가 오류:", error);
    return res.status(500).json({ message: "참가 처리 중 오류" });
  }
});

// 주기적 만료 체크
setInterval(() => {
  const now = Date.now();
  for (const [code, ts] of roomTimestamps.entries()) {
    if (now - ts > ROOM_EXPIRE_TIME) {
      console.log(`🗑️ ${code} 만료 → 정리`);
      cleanupRoom(code);
      // 필요하면 DB에서도 삭제
      // pool.query(`DELETE FROM rooms WHERE room_code = ?`, [code]);
    }
  }
}, 60 * 1000);

function cleanupRoom(roomCode) {
  delete participantCounts[roomCode];
  nicknamesInRoom.delete(roomCode);
  roomTimestamps.delete(roomCode);
}

export default router;
