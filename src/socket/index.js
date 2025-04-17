import { Server } from "socket.io";
import registerRoomSocket from "./roomSocket.js";

export default function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 사용자 연결됨:", socket.id);

    // 방 관련 소켓 이벤트 등록
    registerRoomSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 사용자 연결 해제:", socket.id);
    });
  });
}
