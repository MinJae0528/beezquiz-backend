// ✅ socket/index.js
import { Server } from "socket.io";
import registerRoomSocket from "./roomSocket.js";

export default function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",  // 프론트 주소로 수정 가능
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 사용자 연결됨:", socket.id);

    registerRoomSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 사용자 연결 해제:", socket.id);
    });
  });
}
