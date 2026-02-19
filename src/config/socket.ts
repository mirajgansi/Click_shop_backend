import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: { origin: "*", credentials: true },
  });

  io.on("connection", (socket) => {
    // client should send userId after connect
    socket.on("join", (userId: string) => {
      if (!userId) return;
      socket.join(userId); // room = userId
      // console.log("joined room:", userId);
    });

    socket.on("disconnect", () => {
      // console.log("socket disconnected");
    });
  });

  return io;
}

export function getIO() {
  if (!io)
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  return io;
}
