// src/index.js

// 필수 모듈 import
import http from "http";
import initializeSocket from "./socket/index.js";
import express from "express";       // 서버 생성용
import cors from "cors";             // CORS 허용 (프론트와 통신 위해 필요)
import dotenv from "dotenv";         // 환경변수(.env) 사용

// 라우터 import
import roomRoutes from "./routes/roomRoutes.js";         // 방 생성 / 방 확인
import questionRoutes from "./routes/questionRoutes.js"; // 문제 조회
import resultRoutes from "./routes/resultRoutes.js";     // 결과 저장 / 조회

// 환경변수 설정 로드
dotenv.config();

// Express 앱 생성
const app = express();
const server = http.createServer(app);

// 기본 미들웨어 설정
app.use(cors());                    // 모든 도메인 요청 허용 (CORS)
app.use(express.json());           // JSON 형식 요청 파싱

// 라우터 설정
app.use("/room", roomRoutes);      // /room/create, /room/:code 등
app.use("/room", questionRoutes);  // /room/:code/questions
app.use("/results", resultRoutes); // /results, /results/room/:room_id

// 소켓 연결
initializeSocket(server);

// 서버 실행
app.listen(3001, () => {
  console.log("🚀 서버 실행 중"); // 콘솔에 서버 시작 메시지 출력
});