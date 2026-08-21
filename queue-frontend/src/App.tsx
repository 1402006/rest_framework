import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Kiosk } from "./pages/Kiosk/Kiosk";
import { Display } from "./pages/Display/Display";
import { Track } from "./pages/Track/Track";
import { Agent } from "./pages/Agent/Agent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/kiosk" replace />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/display" element={<Display />} />
        <Route path="/track/:ticketId" element={<Track />} />
        <Route path="/agent" element={<Agent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
