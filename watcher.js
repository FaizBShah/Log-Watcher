const fs = require('fs')
const bf = require('buffer')

class Watcher {
  constructor(file) {
    this._file = file
    this._socket = null
    this._logs = []
  }

  setSocket(socket) {
    this._socket = socket
  }

  getLogs() {
    return this._logs
  }

  setLogs(logs) {
    this._logs.push(...logs)

    if (this._logs.length > 10) {
      this._logs = this._logs.slice(-10)
    }
  }

  displayLogs(logs) {
    logs.forEach((log) => console.log(log))

    if (this._socket) {
      this._socket.emit("log", logs)
    }
  }

  start() {
    const buffer = Buffer.alloc(bf.constants.MAX_STRING_LENGTH)

    fs.open(this._file, (err, fileData) => {
      if (err) throw err
      
      fs.read(fileData, buffer, 0, buffer.length, 0, (err, bytes) => {
        if (err) throw err

        if (bytes > 0) {
          const data = buffer.slice(0, bytes).toString()
          let lines = data.split("\n")

          this.setLogs(lines)
          this.displayLogs(this._logs)
        }

        fs.close(fileData)
      })
    })

    fs.watchFile(this._file, { "interval": 1000 }, (curr, prev) => {
      this.watch(curr, prev)
    })
  }

  watch(curr, prev) {
    const buffer = Buffer.alloc(curr.size - prev.size + 1)

    fs.open(this._file, (err, fileData) => {
      if (err) throw err

      if (curr.size === prev.size) return
      
      fs.read(fileData, buffer, 0, buffer.length, prev.size, (err, bytes) => {
        if (err) throw err

        if (bytes > 0) {
          const data = buffer.slice(0, bytes).toString()
          const lines = prev.size !== 0 ? data.split("\n").slice(1) : data.split("\n")

          this.setLogs(lines)
          this.displayLogs(lines)
        }

        fs.close(fileData)
      })
    })
  }
}

module.exports = Watcher