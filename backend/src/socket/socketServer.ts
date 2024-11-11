/* eslint-disable */
// @ts-nocheck

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/jwt";

let io;

const initSocket = async (server) => {
  io = await new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  console.log(
    "--------- Socket.IO server initialized and listening for connections ---------"
  );

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log(
            "----------- Wrong token! Socket is not connected -----------"
          );
          socket.disconnect();
          return next(new Error("Invalid token"));
        }
        socket.user = decoded;
        next();
      });
    } else {
      next(new Error("Authentication token is missing!"));
      socket.disconnect();
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);
    if (socket.user && socket.user.id) {
      socket.join(`room_${socket.user.id}`);
      console.log(`User joined room room_${socket.user.id}`);
    }

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
      if (socket.user && socket.user.id) {
        socket.leave(`room_${socket.user.id}`);
      }
    });
  });

  return io;
};

// Accessor for other modules to get the `io` instance
const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized. Call initSocket first.");
  }
  return io;
};

export default {
  initSocket,
  getSocketIO,
};
