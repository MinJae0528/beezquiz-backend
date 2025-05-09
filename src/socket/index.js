// src/socket/index.js

import { Server } from "socket.io";
import registerRoomSocket from "./roomSocket.js";

export default function initializeSocket(server) {
  // Socket.IO 서버 생성 (Express HTTP 서버와 결합)
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],  // 허용할 HTTP 메서드
    },
    // path: "/socket.io"       // 기본값이므로 생략 가능
  });

  // 클라이언트 연결 시 처리
  io.on("connection", (socket) => {
    console.log("🟢 사용자 연결됨:", socket.id);

    // 방 관련 이벤트 등록
    registerRoomSocket(io, socket);

    // 클라이언트 연결 해제 시 처리
    socket.on("disconnect", () => {
      console.log("🔴 사용자 연결 해제:", socket.id);
    });
  });
}
