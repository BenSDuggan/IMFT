// Code for web code

import { logger } from './common/logger'
import { config } from './common/config'

import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

export const io = new Server(
  httpServer,
  { cors: { origin: "*", }, }
);

httpServer.listen(config.web.port, () => {
  logger.info(`web: HTTP server started on port ${config.web.port}`)
});
