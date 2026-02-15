import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.post("/api/rooms", async (_req, res) => {
  const code = nanoid(8);
  const room = await prisma.room.create({ data: { name: `Room ${code}`, code } });
  res.json(room);
});

app.get("/api/rooms/:code", async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { code: req.params.code },
    include: { users: { include: { votes: true } } },
  });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

io.on("connection", (socket) => {
  socket.on("join-room", async ({ roomCode, userName }: { roomCode: string; userName: string }) => {
    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) return;
    const user = await prisma.user.create({ data: { name: userName, roomId: room.id } });
    socket.join(roomCode);
    socket.data = { userId: user.id, roomCode };
    const users = await prisma.user.findMany({ where: { roomId: room.id }, include: { votes: true } });
    io.to(roomCode).emit("users-updated", users);
    socket.emit("joined", { userId: user.id, room });
  });

  socket.on("vote", async ({ userId, value }: { userId: number; value: string }) => {
    await prisma.vote.deleteMany({ where: { userId } });
    await prisma.vote.create({ data: { userId, value } });
    const { roomCode } = socket.data || {};
    if (!roomCode) return;
    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) return;
    const users = await prisma.user.findMany({ where: { roomId: room.id }, include: { votes: true } });
    io.to(roomCode).emit("users-updated", users);
  });

  socket.on("reveal", ({ roomCode }: { roomCode: string }) => {
    io.to(roomCode).emit("votes-revealed");
  });

  socket.on("reset", async ({ roomCode }: { roomCode: string }) => {
    const room = await prisma.room.findUnique({ where: { code: roomCode }, include: { users: true } });
    if (!room) return;
    const userIds = room.users.map((u) => u.id);
    await prisma.vote.deleteMany({ where: { userId: { in: userIds } } });
    const users = await prisma.user.findMany({ where: { roomId: room.id }, include: { votes: true } });
    io.to(roomCode).emit("votes-reset", users);
  });

  socket.on("disconnect", async () => {
    const { userId, roomCode } = socket.data || {};
    if (!userId) return;
    await prisma.vote.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    if (roomCode) {
      const room = await prisma.room.findUnique({ where: { code: roomCode }, include: { users: true } });
      if (room) {
        const users = await prisma.user.findMany({ where: { roomId: room.id }, include: { votes: true } });
        io.to(roomCode).emit("users-updated", users);
      }
    }
  });
});

const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
