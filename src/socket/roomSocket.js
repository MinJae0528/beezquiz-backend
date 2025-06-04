const studentMembers = {}; // { roomCode: Set<socket.id> }
const submittedAnswers = {}; // { roomCode: { questionIndex: Set<socket.id> } }
const nicknameMap = new Map(); // socket.id -> nickname

export default function handleRoomSocket(io, socket) {
  socket.on("join-room", (payload) => {
    const { roomCode, role, nickname } =
      typeof payload === "string"
        ? { roomCode: payload, role: "student", nickname: "익명" }
        : payload;

    socket.join(roomCode);

    if (role === "student") {
      studentMembers[roomCode] = studentMembers[roomCode] || new Set();
      studentMembers[roomCode].add(socket.id);
      nicknameMap.set(socket.id, nickname); // ✅ nickname 저장
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
    io.to(roomCode).emit("submit-count", 0); // 초기화
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

      // ✅ 제출한 사람 nickname도 로깅
      const nickname = nicknameMap.get(socket.id) || "익명";
      console.log(`✅ ${nickname} 학생이 ${questionIndex}번 문제 제출`);
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

    nicknameMap.delete(socket.id); // ✅ nickname 제거

    for (const roomCode in submittedAnswers) {
      for (const qIndex in submittedAnswers[roomCode]) {
        submittedAnswers[roomCode][qIndex].delete(socket.id);
      }
    }
  });
}
