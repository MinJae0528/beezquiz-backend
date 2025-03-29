// 📁 src/models/roomModel.js

/**
 * [메모리 기반 방 정보 저장소]
 * 이 파일은 서버가 실행되는 동안만 데이터를 유지하며,
 * 실제 DB가 아니라 JavaScript의 Map() 객체를 사용합니다.
 * 주로 테스트, 임시 저장, 또는 실시간 WebSocket용으로 활용 가능.
 */

// ▶️ rooms: Map 형태로 방 정보 저장
// key: roomCode (랜덤 코드), value: 방 정보 객체
const rooms = new Map();

/**
 * [방 생성 함수]
 * 선생님의 이름을 받아서 6자리 랜덤 방 코드를 만들고,
 * 생성된 방 객체를 Map에 저장합니다.
 */
export function createRoom(teacherName) {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // 예: "A3F9XZ"

  const room = {
    code: roomCode,          // 방 코드
    teacher: teacherName,    // 방 생성자 (선생님 이름)
    createdAt: Date.now(),   // 생성 시각 (timestamp)
  };

  rooms.set(roomCode, room); // Map에 저장
  return room;               // 생성된 방 정보 반환
}

/**
 * [방 조회 함수]
 * 주어진 roomCode로 Map에서 방 정보 가져오기
 */
export function getRoomByCode(code) {
  return rooms.get(code); // 없으면 undefined 반환
}
