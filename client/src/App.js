import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./components/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  )
}

export default App;
