const socket = io("ws://localhost:8080")

socket.on("log", (logs) => {
  logs.forEach(log => {
    document.getElementById('log-container').innerHTML += `<p>${log}</p>`
  })
})