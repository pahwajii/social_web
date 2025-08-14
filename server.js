const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { authSocket, socketServer } = require("./socketServer");
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");
const messages = require("./routes/messages");
const PostLike = require("./models/PostLike");
const Post = require("./models/Post");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API routes
app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);

// Production static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// MongoDB connection
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("MongoDB connected"))
 .catch(err => console.error(err));

const PORT = process.env.PORT || 4000;

// Start server and attach socket.io
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "https://social-web-xi.vercel.app"],
  },
});

io.use(authSocket);
io.on("connection", (socket) => socketServer(socket));