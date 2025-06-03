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
    // 문제 인덱스에 대한 제출자 집합 초기화
    if (!submittedAnswers[roomCode]) {
      submittedAnswers[roomCode] = {};
    }
    submittedAnswers[roomCode][nextIndex] = new Set();

    io.to(roomCode).emit("next-question", nextIndex);
    io.to(roomCode).emit("submit-count", 0); // 교사 화면 제출 인원 초기화
  });

  socket.on("submit-answer", ({ roomCode, questionIndex }) => {
    console.log("🔥 제출 이벤트 수신:", roomCode, questionIndex);
    
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
    // 참가자 제거
    for (const roomCode in studentMembers) {
      if (studentMembers[roomCode].delete(socket.id)) {
        io.to(roomCode).emit(
          "room-member-count",
          studentMembers[roomCode]?.size || 0
        );
      }
    }

    // 제출자 목록에서도 제거
    for (const roomCode in submittedAnswers) {
      for (const qIndex in submittedAnswers[roomCode]) {
        submittedAnswers[roomCode][qIndex].delete(socket.id);
      }
    }
  });
}
