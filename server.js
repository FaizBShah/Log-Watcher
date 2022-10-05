const express = require('express')
const http = require('http');
const path = require('path');
const { Server } = require('socket.io')
const Watcher = require('./watcher')

const app = express();
const server = http.createServer(app)
const io = new Server(server)
const watcher = new Watcher("log.txt")

app.use(express.static(path.join(__dirname, 'public')))

watcher.start()

app.get("/log", (req, res) => {
  res.sendFile(__dirname + "/public/index.html")
})

io.on("connection", (socket) => {
  watcher.setSocket(socket)
  socket.emit("log", watcher.getLogs())
})

const PORT = process.env.PORT || 8080

server.listen(PORT, () => console.log(`Server started at port: ${PORT}`))