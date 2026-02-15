import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL || "";
const FIBONACCI= ["1", "2", "3", "5", "8", "13", "21", "?"];

interface Vote {
  id: number;
  value: string;
  userId: number;
}

interface User {
  id: number;
  name: string;
  votes: Vote[];
}

interface RoomData {
  id: number;
  name: string;
  code: string;
}

export default function Room() {
  const { code } = useParams<{ code: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const defaultName = `Guest-${Math.floor(Math.random() * 100)}`;

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const joinRoom = () => {
    const name = nameInput.trim() || defaultName;
    const s = io(API_URL || undefined, { transports: ["websocket", "polling"] });
    socketRef.current = s;
    setSocket(s);

    s.on("joined", ({ userId: uid, room: r }: { userId: number; room: RoomData }) => {
      setUserId(uid);
      setRoom(r);
      setJoined(true);
    });

    s.on("users-updated", (u: User[]) => setUsers(u));
    s.on("votes-revealed", () => setRevealed(true));
    s.on("votes-reset", (u: User[]) => {
      setUsers(u);
      setRevealed(false);
      setMyVote(null);
    });

    s.emit("join-room", { roomCode: code, userName: name });
  };

  const vote = (value: string) => {
    if (!socket || !userId) return;
    setMyVote(value);
    socket.emit("vote", { userId, value });
  };

  const reveal = () => socket?.emit("reveal", { roomCode: code });
  const reset = () => socket?.emit("reset", { roomCode: code });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold">
          Plan<span className="text-indigo-400">Deck</span>
        </h1>
        <p className="text-gray-400">Enter your name to join</p>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          placeholder={defaultName}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-center text-lg w-64 focus:outline-none focus:border-indigo-500"
          autoFocus
        />
        <button
          onClick={joinRoom}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-lg font-semibold transition-all"
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-5 flex flex-col gap-4 border-r border-gray-700">
        <h2 className="text-xl font-bold text-indigo-400">{room?.name}</h2>
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <div className="mt-2">
          <QRCodeSVG value={window.location.href} size={120} bgColor="transparent" fgColor="#818cf8" />
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Players ({users.length})
          </h3>
          <ul className="space-y-1">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-sm py-1">
                <span
                  className={`w-2 h-2 rounded-full ${u.votes.length > 0 ? "bg-green-400" : "bg-gray-500"}`}
                />
                <span className={u.id === userId ? "font-bold text-indigo-300" : ""}>
                  {u.name}
                  {u.id === userId && " (you)"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Vote Cards */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-wrap gap-4 justify-center max-w-3xl">
            {users.map((u) => {
              const hasVoted = u.votes.length > 0;
              const voteValue = hasVoted ? u.votes[0].value : "";
              return (
                <div key={u.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-20 h-28 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-500 ${
                      hasVoted
                        ? revealed
                          ? "bg-indigo-600 text-white scale-105"
                          : "bg-green-700 text-green-700"
                        : "bg-gray-700 border-2 border-dashed border-gray-600"
                    }`}
                  >
                    {hasVoted ? (revealed ? voteValue : "?") : ""}
                  </div>
                  <span className="text-xs text-gray-400">{u.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex gap-2 flex-wrap">
              {FIBONACCI.map((v) => (
                <button
                  key={v}
                  onClick={() => vote(v)}
                  className={`w-12 h-16 rounded-lg text-lg font-bold transition-all hover:scale-110 ${
                    myVote === v
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={reveal}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold transition-all"
              >
                Reveal
              </button>
              <button
                onClick={reset}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
