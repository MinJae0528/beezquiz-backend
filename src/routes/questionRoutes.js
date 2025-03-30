// src/routes/questionRoutes.js

// Express 라우터 사용을 위한 import
import express from "express";

// 문제 조회 컨트롤러 import (파일명: questioncontroller.js)
import { getQuestionsByRoom } from "../controllers/questionController.js";

// 라우터 객체 생성
const router = express.Router();

/**
 * [문제 조회 API]
 * GET /room/:code/questions
 * 사용자가 입력한 room_code에 해당하는 문제 리스트를 불러옴
 */
router.get("/:code/questions", getQuestionsByRoom);

// 라우터 export → index.js에서 app.use("/room", questionRoutes)로 연결
export default router;
