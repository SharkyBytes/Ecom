// server/socket.js
import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // In production, restrict this to your frontend domain
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Client subscribes to notifications for a specific user
    socket.on("subscribe", (userId) => {
      console.log(`User ${userId} subscribed to notifications`);
      socket.join(`user:${userId}`);
    });
    
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
  
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

export const emitNotification = (userId, data) => {
  if (!io) {
    console.warn("Socket.IO not initialized, can't send notification");
    return;
  }
  
  console.log(`Emitting notification to user:${userId}`, data);
  io.to(`user:${userId}`).emit("notification", data);
};
