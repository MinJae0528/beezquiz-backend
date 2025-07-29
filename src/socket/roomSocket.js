// ✅ socket/roomSocket.js
const studentMembers = {}; // { roomCode: Set<socket.id> }
const submittedAnswers = {}; // { roomCode: { questionIndex: Set<socket.id> } }

export default function handleRoomSocket(io, socket) {
  socket.on("join-room", (payload) => {
    const { roomCode, role } =
      typeof payload === "string"
        ? { roomCode: payload, role: "student" }
        : payload;

    socket.join(roomCode);

    if (role === "student") {
      studentMembers[roomCode] = studentMembers[roomCode] || new Set();
      studentMembers[roomCode].add(socket.id);
    }

    io.to(roomCode).emit(
      "room-member-count",
      studentMembers[roomCode]?.size || 0
    );
  });

  socket.on("start-quiz", (roomCode) => {
    io.to(roomCode).emit("start-quiz");
  });

  socket.on("next-question", ({ roomCode, nextIndex }) => {
    if (!submittedAnswers[roomCode]) {
      submittedAnswers[roomCode] = {};
    }
    submittedAnswers[roomCode][nextIndex] = new Set();

    io.to(roomCode).emit("next-question", nextIndex);
    io.to(roomCode).emit("submit-count", 0);
  });

  socket.on("submit-answer", ({ roomCode, questionIndex }) => {
    if (!submittedAnswers[roomCode]) {
      submittedAnswers[roomCode] = {};
    }
    if (!submittedAnswers[roomCode][questionIndex]) {
      submittedAnswers[roomCode][questionIndex] = new Set();
    }

    const currentSet = submittedAnswers[roomCode][questionIndex];
    if (!currentSet.has(socket.id)) {
      currentSet.add(socket.id);
      io.to(roomCode).emit("submit-count", currentSet.size);
    }
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

    for (const roomCode in submittedAnswers) {
      for (const qIndex in submittedAnswers[roomCode]) {
        submittedAnswers[roomCode][qIndex].delete(socket.id);
      }
    }
  });
}
