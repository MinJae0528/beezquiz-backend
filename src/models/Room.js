import mongoose from "mongoose";

// 개별 질문 스키마 정의
const questionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  correct_answer: { type: String, required: true },
});

const RoomSchema = new mongoose.Schema({
  host: { type: String, default: "default" },
  roomCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  nicknames: { type: [String], default: [] },
  participants: {
    type: Map,
    of: Number,
    default: {},
  },
  questions: {
    type: [questionSchema], // ✅ 문제 배열 추가
    default: [],
  },
});

export default mongoose.model("Room", RoomSchema);
