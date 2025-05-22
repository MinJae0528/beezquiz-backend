import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("🧪 현재 MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ 연결 성공");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ 연결 실패:", err);
    process.exit(1);
  });
