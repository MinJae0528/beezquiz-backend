import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  host: String,
  roomCode: String,
  createdAt: Date,
  nicknames: [String],
  participants: {
    type: Map,
    of: Number,
    default: {},
  },
});

export default mongoose.model("Room", RoomSchema);
