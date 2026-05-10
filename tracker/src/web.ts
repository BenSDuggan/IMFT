// Code for web code

import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

export const io = new Server(
  httpServer,
  { cors: { origin: "*", }, }
);

