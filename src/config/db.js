// src/config/db.js
// ▶MySQL 데이터베이스 연결 설정 파일

// MySQL2 라이브러리 import
import mysql from "mysql2";

// 환경변수(.env) 파일 불러오기
import dotenv from "dotenv";
dotenv.config();

// DB 연결 설정: 환경변수에서 가져오거나 기본값 사용
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",       // DB 호스트 주소
  user: process.env.DB_USER || "root",            // DB 사용자 이름
  password: process.env.DB_PASS || "1234",        // DB 비밀번호
  database: process.env.DB_NAME || "beezquiz_db", // 사용할 DB 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// DB 연결 시도
db.connect((err) => {
  if (err) {
    // 연결 실패 시 에러 로그 출력
    console.error("❌ Database connection failed:", err);
    return;
  }
  // 연결 성공 시 콘솔에 메시지 출력
  console.log("✅ Connected to MySQL Database");
});

// 다른 파일에서 db 객체 사용 가능하게 export
export default db;