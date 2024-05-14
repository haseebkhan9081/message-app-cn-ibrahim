const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();

const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 8000;

// Use the cors middleware
app.use(cors());

// Serve the static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Serve the client.js file with the correct MIME type
app.get("/client.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle GET request for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const users = {};

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("new-user-joined", (data) => {
    users[socket.id] = data;
    socket.broadcast.emit("user-joined", data);
  });

  socket.on("send-message", (message) => {
    socket.broadcast.emit("recieve-message", {
      message: message,
      username: users[socket.id],
    });
  });

  // for filling
  socket.on("file", (file) => {
    // Broadcast the file to all clients except the sender
    socket.broadcast.emit("file", file);

    // Handle the file on the server side, such as saving it to disk
    const filePath = path.join(__dirname, "uploads", file.name);
    console.log("file path on server")
    fs.writeFile(filePath, file.data, "base64", (err) => {
      if (err) {
        console.error("Error saving file:", err);
      } else {
        console.log("File saved:", file.name);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("sorry user to war gya", users[socket.id]);
    socket.broadcast.emit("userLeft", users[socket.id]);
    delete users[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
