const roomMembers = {};  // { roomCode: Set(socket.id) }

export default function handleRoomSocket(io, socket) {
  // 방 참가
  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);

    if (!roomMembers[roomCode]) {
      roomMembers[roomCode] = new Set();
    }
    roomMembers[roomCode].add(socket.id);

    const count = roomMembers[roomCode].size;
    io.to(roomCode).emit("room-member-count", count);
  });

  // 선생님이 퀴즈 시작
  socket.on("start-quiz", (roomCode) => {
    console.log(`🟢 ${roomCode} 방 퀴즈 시작됨`);
    io.to(roomCode).emit("start-quiz");  // 모든 참가자에게 시작 신호
  });

  // 퀴즈 종료 (선택)
  socket.on("quiz-finished", (roomCode) => {
    console.log(`🔴 ${roomCode} 방 퀴즈 종료됨`);
    io.to(roomCode).emit("quiz-finished");  // 모든 참가자에게 종료 신호
  });

  // 연결 종료
  socket.on("disconnect", () => {
    for (const roomCode in roomMembers) {
      roomMembers[roomCode].delete(socket.id);
      const count = roomMembers[roomCode].size;
      io.to(roomCode).emit("room-member-count", count);
    }
  });
}
