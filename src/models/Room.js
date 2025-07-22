// ✅ models/Room.js (수정된 버전)
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true }, 
  correctAnswer: { type: String, required: true }, 
  type: { type: String, default: "subjective" },
  options: { type: [String], default: undefined },
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
    type: [questionSchema],
    default: [],
  },
});

export default mongoose.model("Room", RoomSchema);
