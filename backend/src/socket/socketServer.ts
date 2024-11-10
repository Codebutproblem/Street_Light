/* eslint-disable */
// @ts-nocheck

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = "Sk8im+3icclpjK0rR2emiQ==";

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

    // Handle user-specific rooms (by userID)
    if (socket.user && socket.user.id) {
      socket.join(`${CONST.SOCKET_SEND.ROOM}${socket.user.userID}`);
      console.log(
        `==================== User with socket ${socket.id} joined room ${CONST.SOCKET_SEND.ROOM}${socket.user.userID}`
      );
    }

    // Logging when user disconnects
    socket.on("disconnect", () => {
      console.log(
        "==================== User disconnected =================== " +
          socket.id
      );
      if (socket.user) {
        if (socket.user.userID) {
          socket.leave(socket.user.userID);
          console.log(
            `==================== User with socket ${socket.id} left room ${CONST.SOCKET_SEND.ROOM}${socket.user.userID}`
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
