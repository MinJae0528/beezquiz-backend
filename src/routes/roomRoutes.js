// src/routes/roomRoutes.js
import express from "express";
import Room from "../models/Room.js";
import { randomBytes } from "crypto";

const router = express.Router();

// 방 상태 관리 메모리 (만료 시간 등)
const participantCounts = {};
const roomTimestamps = new Map();
const ROOM_EXPIRE_TIME = 10 * 60 * 1000; // 10분

// ✅ 테스트용 라우터
router.get("/", (req, res) => {
  res.json({ message: "✅ /rooms 라우터 정상 작동 중!" });
});

// ✅ 방 생성
router.post("/create", async (req, res) => {
  try {
    const { host } = req.body;
    if (!host) return res.status(400).json({ message: "host 값이 없습니다." });

    const roomCode = randomBytes(3).toString("hex").toUpperCase();
    const createdAt = new Date();

    const newRoom = new Room({
      host,
      roomCode,
      createdAt,
      participants: {},
      nicknames: [],
    });

    await newRoom.save();

    roomTimestamps.set(roomCode, Date.now());
    participantCounts[roomCode] = 0;

    return res.status(200).json({ roomCode });
  } catch (err) {
    console.error("🔥 Mongo 방 생성 오류:", err);
    return res.status(500).json({ message: "방 생성 실패" });
  }
});

// ✅ 방 참가 API
router.post("/join", async (req, res) => {
  try {
    const { roomCode, nickname, role } = req.body;
    if (!roomCode || !nickname || !role) {
      return res.status(400).json({ message: "roomCode, nickname 또는 role이 없습니다." });
    }

    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: "해당 방이 존재하지 않습니다." });

    // 만료 검사
    const ts = roomTimestamps.get(roomCode);
    if (!ts || Date.now() - ts > ROOM_EXPIRE_TIME) {
      await Room.deleteOne({ roomCode });
      roomTimestamps.delete(roomCode);
      participantCounts[roomCode] = 0;
      return res.status(410).json({ message: "방이 만료되었습니다." });
    }

    if (room.nicknames.includes(nickname)) {
      return res.status(400).json({ message: "이미 사용 중인 닉네임입니다." });
    }

    room.nicknames.push(nickname);
    if (role === "student") {
      room.participants[nickname] = 0;
      participantCounts[roomCode] = (participantCounts[roomCode] || 0) + 1;
    }

    await room.save();

    return res.status(200).json({
      message: "참가 성공",
      participantCount: participantCounts[roomCode] || 0,
    });
  } catch (error) {
    console.error("참가 오류:", error);
    return res.status(500).json({ message: "참가 처리 중 오류" });
  }
});

// ✅ 요약 API
router.get("/:roomCode/summary", async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ message: "방이 존재하지 않습니다." });

    const scores = Object.values(room.participants);
    const total = scores.length;
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const average = total > 0 ? totalScore / total : 0;

    return res.json({
      averageScore: average,
      participants: Object.entries(room.participants).map(([name, score]) => ({
        nickname: name,
        score,
      })),
    });
  } catch (err) {
    console.error("요약 오류:", err);
    return res.status(500).json({ message: "요약 실패" });
  }
});

// ✅ 방 만료 정리
setInterval(async () => {
  const now = Date.now();
  for (const [code, ts] of roomTimestamps.entries()) {
    if (now - ts > ROOM_EXPIRE_TIME) {
      await Room.deleteOne({ roomCode: code });
      participantCounts[code] = 0;
      roomTimestamps.delete(code);
      console.log(`💥 ${code} 방 만료 및 삭제됨`);
    }
  }
}, 60 * 1000);

export default router;
