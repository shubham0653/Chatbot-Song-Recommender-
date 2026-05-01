require("dotenv").config();
const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");

const app = express();

// ✅ Fix 1 — Allow all origins
app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const PORT = process.env.PORT || 8000;

// ✅ Fix 2 — Bind to 0.0.0.0 so mobile can reach it
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://192.168.0.103:${PORT}`);
});