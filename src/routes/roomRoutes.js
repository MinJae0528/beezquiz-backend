// src/routes/roomRoutes.js

// Express 라우터 설정
import express from "express";

// 컨트롤러 함수 import (방 생성 & 방 코드 확인)
import { createRoom, checkRoom } from "../controllers/roomController.js";

// 라우터 객체 생성
const router = express.Router();

/**
 * [방 생성 API]
 * POST /room/create
 * 선생님이 방을 만들고 문제들을 함께 전송할 때 호출됨
 * DB에 방 정보 + 문제 리스트가 저장됨
 */
router.post("/create", createRoom);

/**
 * [방 존재 확인 API]
 * GET /room/:code
 * 사용자가 입력한 방 코드가 유효한지 확인
 * → 존재 여부만 true/false로 응답
 */
router.get("/:code", checkRoom);

// 라우터 내보내기 → index.js에서 app.use("/room", roomRoutes)로 사용
export default router;
