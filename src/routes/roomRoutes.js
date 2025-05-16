import express from "express";
import pool from "../config/db.js";
import { randomBytes } from "crypto";
import { getRoomSummary } from "../controllers/roomController.js";

const router = express.Router();

// 메모리 저장소 (방 상태 관리용)
const participantCounts = {};            // { roomCode: 현재 참가자 수 }
const nicknamesInRoom = new Map();       // { roomCode: Set(nicknames) }
const roomTimestamps = new Map();        // { roomCode: 생성된 시간(timestamp) }
const ROOM_EXPIRE_TIME = 10 * 60 * 1000; // 10분

// ✅ 테스트용 기본 GET 라우트 추가
router.get("/", (req, res) => {
  res.json({ message: "✅ /rooms 라우터 정상 작동 중!" });
});

// ✅ 퀴즈 요약 조회 API
router.get("/:roomCode/summary", getRoomSummary);

// [POST] /rooms/create - 방 생성
router.post("/create", async (req, res) => {
  try {
    const { host } = req.body;
    if (!host) return res.status(400).json({ message: "host 값이 없습니다." });

    const roomCode = randomBytes(3).toString("hex").toUpperCase(); // 예: 'A1B2C3'
    const createdAt = new Date();

    // 메모리 등록
    participantCounts[roomCode] = 0;
    nicknamesInRoom.set(roomCode, new Set());
    roomTimestamps.set(roomCode, Date.now());

    // DB 저장
    const sql = `INSERT INTO rooms (host, room_code, created_at) VALUES (?, ?, ?)`;
    await pool.query(sql, [host, roomCode, createdAt]);

    return res.status(200).json({ roomCode });
  } catch (error) {
    console.error("방 생성 오류:", error);
    return res.status(500).json({ message: "방 생성 실패" });
  }
});

// [POST] /rooms/join - 방 참가
router.post("/join", async (req, res) => {
  try {
    const { roomCode, nickname, role } = req.body;
    if (!roomCode || !nickname || !role) {
      return res.status(400).json({ message: "roomCode, nickname 또는 role이 없습니다." });
    }

    // 방 만료 확인
    const ts = roomTimestamps.get(roomCode);
    if (!ts || Date.now() - ts > ROOM_EXPIRE_TIME) {
      await cleanupRoom(roomCode);
      return res.status(410).json({ message: "방이 만료되었습니다." });
    }

    // 닉네임 중복 확인
    const nameSet = nicknamesInRoom.get(roomCode) || new Set();
    if (nameSet.has(nickname)) {
      return res.status(400).json({ message: "이미 사용 중인 닉네임입니다." });
    }
    nameSet.add(nickname);
    nicknamesInRoom.set(roomCode, nameSet);

    // 참가자 수 증가 (학생만 반영)
    if (role === "student") {
      participantCounts[roomCode] = (participantCounts[roomCode] || 0) + 1;
    }

    return res.status(200).json({
      message: "참가 성공",
      participantCount: participantCounts[roomCode] || 0,
    });
  } catch (error) {
    console.error("방 참가 오류:", error);
    return res.status(500).json({ message: "참가 처리 중 오류" });
  }
});

// 주기적 방 만료 검사
setInterval(() => {
  const now = Date.now();
  for (const [code, ts] of roomTimestamps.entries()) {
    if (now - ts > ROOM_EXPIRE_TIME) {
      console.log(`${code} 방 만료됨 → 정리`);
      cleanupRoom(code);
    }
  }
}, 60 * 1000);

// 방 정리 함수
async function cleanupRoom(roomCode) {
  delete participantCounts[roomCode];
  nicknamesInRoom.delete(roomCode);
  roomTimestamps.delete(roomCode);

  try {
    // 문제 삭제
    await pool.query(`
      DELETE FROM questions WHERE room_id IN (
        SELECT room_id FROM rooms WHERE room_code = ?
      )
    `, [roomCode]);

    // 방 삭제
    await pool.query(`DELETE FROM rooms WHERE room_code = ?`, [roomCode]);

    console.log(`[DB] ${roomCode} 방 및 문제 삭제 완료`);
  } catch (err) {
    console.error("DB 방 삭제 중 오류:", err);
  }
}

export default router;
