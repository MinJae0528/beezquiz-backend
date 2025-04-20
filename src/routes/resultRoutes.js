// src/routes/resultRoutes.js

import express from "express";
import { saveResult, getResultsByRoom } from "../controllers/resultController.js";

const router = express.Router();

/**
 * [POST] /results
 * 사용자가 퀴즈를 제출하면 결과를 저장하는 API
 * 요청 body: { room_id, nickname, answers: [] }
 * - 자동 채점 후 점수와 함께 DB에 저장
 */
router.post("/", saveResult);

/**
 * [GET] /results/room/:room_id
 * 특정 방의 모든 참가자 결과를 조회하는 API
 * 응답: [ { nickname, score, completed_at }, ... ]
 */
router.get("/room/:room_id", getResultsByRoom);

export default router;
