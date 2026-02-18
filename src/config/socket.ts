import { Server } from "socket.io";

let io: Server | null = null;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3003"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔥 socket connected:", socket.id);

    socket.on("join", (userId: string) => {
      console.log("📦 joined room:", userId);
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
