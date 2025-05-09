import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import roomRoutes     from "./routes/roomRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultRoutes   from "./routes/resultRoutes.js";
import initializeSocket from "./socket/index.js";

dotenv.config();

const app    = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/room",    roomRoutes);
app.use("/room",    questionRoutes);
app.use("/results", resultRoutes);

initializeSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중`);
});
