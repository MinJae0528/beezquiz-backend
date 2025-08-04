// ✅ models/Room.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },            // 문제 내용
  correctAnswer: { type: String, required: true },   // 정답 (객관식: "1","2","3","4", 서술형: 문자열)
  type: { type: String, default: "subjective" },     // 문제 타입
  options: { type: [String], default: undefined },   // 객관식 보기 (서술형이면 undefined)
});

const RoomSchema = new mongoose.Schema({
  host: { type: String, default: "비공개" },
  roomCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  nicknames: { type: [String], default: [] },
  participants: {
    type: Map,
    of: Number,
    default: {},
  },
  questions: {
    type: [questionSchema],
    default: [],
  },
});

export default mongoose.model("Room", RoomSchema);
