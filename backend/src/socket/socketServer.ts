/* eslint-disable */
// @ts-nocheck

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/jwt";

let io;

const initSocket = async (server) => {
  // Initialize the socket server
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

  // Validate the connection authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log(
            "----------- Wrong token! Socket is not connected --------------------"
          );
          socket.disconnect();
          return next(new Error("Invalid token"));
        }

        // Attach the user information to the socket object
        socket.user = decoded;
        console.log(
          "--------- Socket.IO server initialized and listening for connections ---------",
          socket.user
        );
        next();
      });
    } else {
      next(new Error("Authentication token is missing!"));
      socket.disconnect();
    }
  });

  // Handle new connections
  io.on("connection", (socket) => {
    console.log(
      "==================== User connected =================== " + socket.id
    );

    // Handle user-specific rooms (by id)
    if (socket.user && socket.user.id) {
      socket.join(`room_${socket.user.id}`);
      console.log(
        `==================== User with socket ${socket.id} joined room room_${socket.user.id}`
      );
    }

    // Logging when user disconnects
    socket.on("disconnect", () => {
      console.log(
        "==================== User disconnected =================== " +
          socket.id
      );
      if (socket.user) {
        if (socket.user.id) {
          socket.leave(socket.user.id);
          console.log(
            `==================== User with socket ${socket.id} left room room_${socket.user.id}`
          );
        }
      }
    });
  });
};

// Function to get the Socket.IO instance
const getSocketIO = () => {
  return io;
};

export default {
  getSocketIO,
  initSocket,
};
