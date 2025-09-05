import React, { useState } from "react";

function App() {
  const [profileData, setProfileData] = useState(null);   
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProfileData = async (event) => {
    event.preventDefault();
    if (!searchTerm) return;

    setLoading(true);

    const gameName = searchTerm.split("#")[0];
    const tagLine = searchTerm.split("#")[1];

    try {
      const response = await fetch(
        `http://localhost:5000/profile?gameName=${encodeURIComponent(
          gameName
        )}&tagLine=${encodeURIComponent(tagLine)}`
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();
      setProfileData(data);
      setLoading(false);
    } catch (error) {
      console.log(error)
      setProfileData("");
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1>League of Legends API Website</h1>
      <form onSubmit={fetchProfileData}>
        <input
          type="text"
          placeholder="SummonerName#TagLine"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        ></input>
      </form>
      <button
        type="submit"
        onClick={fetchProfileData}
        className="search-button"
      >
        🔎
      </button>
      <h2>Profile Data:</h2>
      {loading && <p>Loading...</p>}
      {!loading && profileData && (
        <pre>{JSON.stringify(profileData, null, 2)}</pre>
      )}
      {!loading && !profileData && <p>No profile data found.</p>}
    </div>
  );
}

export default App;
