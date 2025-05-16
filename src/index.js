import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import roomRoutes from "./routes/roomRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import initializeSocket from "./socket/index.js";

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5초 타임아웃
    });
    console.log('✅ MongoDB 연결 성공! 상태:', connection.connection.readyState); // 1: 연결됨

    app.use(cors());
    app.use(express.json());

    app.use("/rooms", roomRoutes);
    app.use("/questions", questionRoutes);
    app.use("/results", resultRoutes);

    initializeSocket(server);

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중`);
    });
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err);
    process.exit(1);
  }
};

startServer();