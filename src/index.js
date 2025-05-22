import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import roomRoutes from "./routes/roomRoutes.js";
import initializeSocket from "./socket/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB 연결 성공");

    app.use(cors({ origin: "http://localhost:3000", credentials: true }));
    app.options("*", cors());
    app.use(express.json());

    app.use("/rooms", roomRoutes);

    initializeSocket(server); // 필요 없다면 주석처리해도 됨

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 서버 실행 중: ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB 연결 실패:", err);
    process.exit(1);
  }
};

startServer();
