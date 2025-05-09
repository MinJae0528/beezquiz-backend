const studentMembers = {}; // { roomCode: Set<socket.id> }

export default function handleRoomSocket(io, socket) {
  socket.on("join-room", (payload) => {
    const { roomCode, role } =
      typeof payload === "string"
        ? { roomCode: payload, role: "student" }
        : payload;

    socket.join(roomCode);

    // ✅ 학생만 참가자로 카운트
    if (role === "student") {
      studentMembers[roomCode] = studentMembers[roomCode] || new Set();
      studentMembers[roomCode].add(socket.id);
    }

    // ✅ 참가자 수 갱신 (학생만 포함)
    io.to(roomCode).emit(
      "room-member-count",
      studentMembers[roomCode]?.size || 0
    );
  });

  socket.on("start-quiz", (roomCode) => {
    io.to(roomCode).emit("start-quiz");
  });

  socket.on("next-question", ({ roomCode, nextIndex }) => {
    io.to(roomCode).emit("next-question", nextIndex);
  });

  socket.on("quiz-finished", (roomCode) => {
    io.to(roomCode).emit("quiz-finished");
  });

  socket.on("disconnect", () => {
    for (const roomCode in studentMembers) {
      if (studentMembers[roomCode].delete(socket.id)) {
        io.to(roomCode).emit(
          "room-member-count",
          studentMembers[roomCode]?.size || 0
        );
      }
    }
  });
}
