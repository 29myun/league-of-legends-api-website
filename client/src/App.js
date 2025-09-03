import React, { useEffect, useState } from "react";

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1>League of Legends API Website</h1>
      <p>
        This is a boilerplate React frontend connected to your Express backend.
      </p>
      <h2>Profile Data:</h2>
      {loading && <p>Loading...</p>}
      {!loading && profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}
      {!loading && !profile && <p>No profile data found.</p>}
    </div>
  );
}

export default App;
