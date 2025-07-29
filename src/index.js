// ✅ server.js
import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import roomRoutes from "./routes/roomRoutes.js";         // /rooms 관련 (생성)
import questionRoutes from "./routes/questionRoutes.js"; // /room/:roomCode/questions 관련
import resultRoutes from "./routes/resultRoutes.js";     // /result 관련 (저장, 요약)
import initializeSocket from "./socket/index.js";        // 소켓 설정

dotenv.config();

const app = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB 연결 성공");

    app.use(cors({ origin: "http://localhost:3000", credentials: true }));
    app.use(express.json());

    // 라우터 등록
    app.use("/rooms", roomRoutes);          // 방 생성
    app.use("/room", questionRoutes);       // 문제 저장 및 불러오기
    app.use("/result", resultRoutes);       // 결과 저장 및 요약

    app.use((req, res) => {
      res.status(404).json({ error: "존재하지 않는 경로입니다." });
    });

    initializeSocket(server);

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
