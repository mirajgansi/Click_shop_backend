import app from "./app";
import { PORT } from "./config";
import { initSocket } from "./config/socket";
import { connectDatabase } from "./database/mongodb";
import http from "http";

async function startServer() {
  await connectDatabase();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}

startServer();
