// src/routes/resultRoutes.js

// Express 라우터 사용
import express from "express";

// 결과 저장 및 조회용 컨트롤러 함수 import
import { saveResult, getResultsByRoom } from "../controllers/resultController.js";

// 라우터 객체 생성
const router = express.Router();

/**
 * [결과 저장 API]
 * POST /results
 * 사용자가 퀴즈를 마치고 제출한 정답들을 서버로 보내면
 * 자동 채점을 통해 점수를 계산 후 DB에 저장
 */
router.post("/", saveResult);

/**
 * [결과 조회 API]
 * GET /results/room/:room_id
 * 특정 방(room_id)에 참여한 사용자들의 닉네임, 점수, 완료 시간을 조회
 * 선생님용 대시보드에서 통계로 활용 가능
 */
router.get("/room/:room_id", getResultsByRoom);

// 라우터 export → index.js에서 app.use("/results", resultRoutes)로 사용됨
export default router;
