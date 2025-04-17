// roomRoutes.js (또는 roomController.js 등)

import express from "express";

const router = express.Router();
const participantCounts = {}; // { roomCode: 인원수 }
const nicknamesInRoom = new Map(); // { roomCode: Set(nicknames) }
const roomTimestamps = new Map(); // ✅ 방 생성 시간 기록용
const ROOM_EXPIRE_TIME = 1000 * 60 * 60; // ✅ 예: 1시간

// ✅ 방 생성
router.post("/create", async (req, res) => {
  try {
    const { host } = req.body;
    if (!host) return res.status(400).json({ message: "host 값이 없습니다." });

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    participantCounts[roomCode] = 0;
    nicknamesInRoom.set(roomCode, new Set());
    roomTimestamps.set(roomCode, Date.now()); // ✅ 생성 시간 기록

    res.json({ roomCode });
  } catch (error) {
    console.error("❌ 방 생성 오류:", error);
    res.status(500).json({ message: "방 생성 실패" });
  }
});

// ✅ 방 참가
router.post("/join", (req, res) => {
  const { roomCode, nickname } = req.body;

  if (!roomCode || !nickname) {
    return res.status(400).json({ message: "roomCode나 nickname이 없습니다." });
  }

  // 만료 확인
  const createdAt = roomTimestamps.get(roomCode);
  if (!createdAt || Date.now() - createdAt > ROOM_EXPIRE_TIME) {
    cleanupRoom(roomCode);
    return res.status(410).json({ message: "방이 만료되었습니다." });
  }

  if (!nicknamesInRoom.has(roomCode)) {
    nicknamesInRoom.set(roomCode, new Set());
  }

  const nicknameSet = nicknamesInRoom.get(roomCode);
  if (nicknameSet.has(nickname)) {
    return res.status(400).json({ message: "이미 사용 중인 닉네임입니다." });
  }

  nicknameSet.add(nickname);
  participantCounts[roomCode] = (participantCounts[roomCode] || 0) + 1;

  console.log(`✅ ${roomCode} 참가자 수: ${participantCounts[roomCode]}`);
  res.status(200).json({ message: "참가 성공", participantCount: participantCounts[roomCode] });
});

// ✅ 주기적 만료 체크 (선택적으로 사용 가능)
setInterval(() => {
  const now = Date.now();
  for (const [roomCode, createdAt] of roomTimestamps.entries()) {
    if (now - createdAt > ROOM_EXPIRE_TIME) {
      console.log(`🗑️ ${roomCode} 만료됨 → 삭제`);
      cleanupRoom(roomCode);
    }
  }
}, 1000 * 60); // 1분마다 체크

// ✅ 방 관련 데이터 정리 함수
function cleanupRoom(roomCode) {
  participantCounts[roomCode] = 0;
  nicknamesInRoom.delete(roomCode);
  roomTimestamps.delete(roomCode);
}

export default router;
