import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Home() {
  const navigate = useNavigate();
  const [room, setRoom] = useState<{ code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const createRoom = async () => {
    const res = await fetch(`${API_URL}/api/rooms`, { method: "POST" });
    const data = await res.json();
    setRoom(data);
  };

  const roomUrl = room ? `${window.location.origin}/room/${room.code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      <h1 className="text-5xl font-bold tracking-tight">
        Plan<span className="text-indigo-400">Deck</span>
      </h1>
      <p className="text-gray-400 text-lg">Lightning-fast Planning Poker for your team</p>

      {!room ? (
        <button
          onClick={createRoom}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xl font-semibold transition-all hover:scale-105"
        >
          New Session
        </button>
      ) : (
        <div className="flex flex-col items-center gap-6 bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <p className="text-gray-400 text-sm">Share this link with your team</p>
          <div className="bg-gray-700 rounded-lg px-4 py-3 w-full text-center text-sm font-mono break-all">
            {roomUrl}
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={copyLink}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-all"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={() => navigate(`/room/${room.code}`)}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-all"
            >
              Join Room
            </button>
          </div>
          <QRCodeSVG value={roomUrl} size={180} bgColor="transparent" fgColor="#818cf8" />
        </div>
      )}
    </div>
  );
}
