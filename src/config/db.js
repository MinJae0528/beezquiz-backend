// src/config/db.js

// MySQL 연결을 위한 mysql2의 Promise 기반 모듈 불러오기
import mysql from 'mysql2/promise';

// 환경변수(.env)에서 DB 설정값을 불러오기 위해 dotenv 사용
import dotenv from 'dotenv';
dotenv.config();

// MySQL 연결 풀(Pool) 생성
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',     // DB 호스트 주소
  user:     process.env.DB_USER     || 'root',          // DB 사용자 이름
  password: process.env.DB_PASS     || '1234',          // DB 비밀번호
  database: process.env.DB_NAME     || 'beezquiz_db',   // 사용할 DB 이름

  // 연결 풀 설정
  waitForConnections: true,   // 연결이 가능할 때까지 대기
  connectionLimit:    10,     // 동시에 유지할 수 있는 최대 연결 수
  queueLimit:         0       // 대기열 제한 없음 (0이면 무제한)
});

// 연결 성공 시 콘솔에 메시지 출력
console.log('MySQL pool created (promise API)');

// 다른 파일에서 pool 객체를 사용할 수 있도록 내보내기
export default pool;
