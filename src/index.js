// src/index.js

// 서버 및 소켓 설정에 필요한 모듈 import
import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initializeSocket from "./socket/index.js";

// 라우터 import (기능별 분리)
import roomRoutes from "./routes/roomRoutes.js";         // 방 생성 및 참가 관련
import questionRoutes from "./routes/questionRoutes.js"; // 문제 저장 및 조회
import resultRoutes from "./routes/resultRoutes.js";     // 결과 저장 및 조회

// .env 파일에서 환경변수 로드
dotenv.config();

// Express 앱과 HTTP 서버 인스턴스 생성
const app = express();
const server = http.createServer(app);

// 공통 미들웨어 등록
app.use(cors());            // 모든 도메인에서 요청 허용 (CORS 문제 해결용)
app.use(express.json());    // JSON 형식의 요청 본문을 파싱

// API 라우팅
app.use("/room", roomRoutes);      // 방 생성 및 참가 관련 엔드포인트
app.use("/room", questionRoutes);  // 문제 저장 및 조회 (방 코드 포함)
app.use("/results", resultRoutes); // 결과 저장 및 조회

// WebSocket 초기화
initializeSocket(server);  // 소켓 기능을 서버에 연결

// 서버 실행 (포트 3001)
app.listen(3001, () => {
  console.log("🚀서버가 3001번 포트에서 실행 중");
});
