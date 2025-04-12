const roomMembers = {};  // { roomCode: Set(socket.id) }

export default function handleRoomSocket(io, socket) {
  // 방 참가
  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);

    // 인원 수 관리
    if (!roomMembers[roomCode]) {
      roomMembers[roomCode] = new Set();
    }
    roomMembers[roomCode].add(socket.id);

    // 인원 수 브로드캐스트
    const count = roomMembers[roomCode].size;
    io.to(roomCode).emit("room-member-count", count);
  });

  // 방 나가기 또는 연결 끊김
  socket.on("disconnect", () => {
    for (const roomCode in roomMembers) {
      roomMembers[roomCode].delete(socket.id);

      // 인원 수 업데이트
      const count = roomMembers[roomCode].size;
      io.to(roomCode).emit("room-member-count", count);
    }
  });
}
