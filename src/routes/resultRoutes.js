import express from "express";
import { saveResult, getResultsByRoom } from "../controllers/resultController.js";

const router = express.Router();

router.post("/", saveResult);
router.get("/room/:room_id", getResultsByRoom);

export default router;
