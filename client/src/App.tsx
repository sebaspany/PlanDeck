import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Room from "./components/Room";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:code" element={<Room />} />
      </Routes>
    </div>
  );
}
