import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import roomRoutes from "./routes/roomRoutes.js";         // /rooms 관련 (생성, 참가, 요약)
import questionRoutes from "./routes/questionRoutes.js"; // /room/:roomCode/questions 관련
import resultRoutes from "./routes/resultRoutes.js";     // /result 관련 (저장, 요약)
import initializeSocket from "./socket/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB 연결 성공");

    // CORS 설정
    app.use(cors({ origin: "http://localhost:3000/", credentials: true }));
    app.options("*", cors());
    app.use(express.json());

    // ─────────────────────────
    // 전체 라우터 마운트
    // ─────────────────────────

    // 1) 방(Room) 관련
    //   POST   /rooms/create            → 방 생성
    //   POST   /rooms/join              → 방 참가
    //   GET    /rooms/:roomCode/summary → 방 점수 요약 조회
    app.use("/rooms", roomRoutes);

    // 2) 문제(Question) 관련
    //   POST   /room/:roomCode/questions → 문제 저장
    //   GET    /room/:roomCode/questions → 문제 불러오기
    app.use("/room", questionRoutes);

    // 3) 결과(Result) 관련
    //   POST   /result                   → 퀴즈 결과 저장
    //   GET    /result/summary/:roomCode → 퀴즈 결과 요약 조회
    app.use("/result", resultRoutes);

    // ─────────────────────────

    initializeSocket(server); // 소켓 사용 안 하면 주석 처리 가능

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 서버 실행 중: ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB 연결 실패:", err);
    process.exit(1);
  }
};

startServer();