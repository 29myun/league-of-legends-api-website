import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to League of Legends Stats</h1>
      <p>Navigate to different sections:</p>
      <ul>
        <button><Link to="/profile">Profile</Link></button>
        <button><Link to="/champions">Champions</Link></button>
        <button><Link to="/items">Items</Link></button>
      </ul>
    </div>
  )
}    