import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home"
import Profile from "./components/Profile";
import Champions from "./components/Champions";
import Items from "./components/Items";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/champions" element={<Champions />} />
        <Route path="/items" element={<Items />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  )
}

export default App;
