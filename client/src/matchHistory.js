import React, { useState } from "react";
import "./index.css";
import { formatSeconds, getTimeAgo } from "./time";
import { championIds, summonerSpellIds, perkIds, queueIds } from "./ids";

const serverPort = 5069;

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
        `http://localhost:${serverPort}/match-history?gameName=${encodeURIComponent(
          gameName
        )}&tagLine=${encodeURIComponent(tagLine)}`
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();
      setProfileData(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setProfileData("");
      setLoading(false);
    }
  };

  function MatchDetails({ profileData }) {
    let matches = [];
    for (let i = 0; i < profileData.matches.length; i++) {
      const match = profileData.matches[i];
      const matchParticipants = match.info.participants;
      const currentProfileMatchData = matchParticipants.find(
        (participant) => participant.riotIdGameName === profileData.gameName
      );
      const currentProfileMatchTotalCs =
        currentProfileMatchData.totalMinionsKilled +
        currentProfileMatchData.neutralMinionsKilled;

      let winOrLoss;
      let winOrLossColor;
      let matchBackgroundColor;
      let iconBackgroundColor = "rgba(255, 255, 255, 0.1)";

      if (currentProfileMatchData.win) {
        winOrLoss = "WIN";
        winOrLossColor = "rgba(0, 0, 255, 1)";
        matchBackgroundColor = "rgba(0, 0, 255, 0.6)";
      } else {
        winOrLoss = "LOSS";
        winOrLossColor = "rgba(255, 0, 0, 1)";
        matchBackgroundColor = "rgba(225, 50, 50, 0.6";
      }

      matches.push(
        <div
          className="match-container"
          key={i}
          style={{
            backgroundColor: matchBackgroundColor,
          }}
        >
          {/* Match Info */}
          <div className="match-details-container">
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>
              {queueIds[match.info.queueId]}
            </div>
            <div style={{ fontSize: "12px " }}>
              {getTimeAgo(match.info.gameCreation)}
            </div>
            <div
              style={{
                color: winOrLossColor,
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {winOrLoss}{" "}
              <span style={{ color: "white", fontWeight: "normal" }}>
                {formatSeconds(match.info.gameDuration)}
              </span>
            </div>
          </div>

          <div className="champion-summoner-spells-perks-icons-container">
            {/* Champion */}
            <div>
              <div
                style={{
                  backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${currentProfileMatchData.championName}.png`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  width: "52px",
                  height: "52px",
                  marginRight: "2px",
                  borderRadius: "2px",
                }}
              />
            </div>

            {/* Summoner Spells */}
            <div>
              {[
                currentProfileMatchData.summoner1Id,
                currentProfileMatchData.summoner2Id,
              ].map((summonerSpell, index) => (
                <div
                  key={index}
                  style={{
                    backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/${summonerSpellIds[summonerSpell]}.png)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "25px",
                    height: "25px",
                    margin: "2px",
                    borderRadius: "5px",
                  }}
                />
              ))}
            </div>

            {/* Perks */}
            <div>
              {[
                `url(https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${
                  perkIds[currentProfileMatchData.perks.styles[0].style]
                    .folderName
                }/${
                  perkIds[
                    currentProfileMatchData.perks.styles[0].selections[0].perk
                  ]
                }/${
                  perkIds[
                    currentProfileMatchData.perks.styles[0].selections[0].perk
                  ]
                }.png)`,
                `url(https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${
                  perkIds[currentProfileMatchData.perks.styles[1].style].style
                }.png)`,
              ].map((perkIconUrl, index) => (
                <div
                  key={index}
                  style={{
                    backgroundImage: perkIconUrl,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "25px",
                    height: "25px",
                    backgroundColor: iconBackgroundColor,
                    borderRadius: "5px",
                    margin: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Match Post Stats*/}
          <div className="match-post-stats-container">
            <div>
              {currentProfileMatchData.kills} /{" "}
              <span style={{ color: "red" }}>
                {currentProfileMatchData.deaths}
              </span>{" "}
              / {currentProfileMatchData.assists}
            </div>
            <div className="other">
              <span style={{ fontWeight: "800", color: "white" }}>
                {Math.round(
                  ((currentProfileMatchData.kills +
                    currentProfileMatchData.assists) /
                    Math.max(currentProfileMatchData.deaths, 1)) *
                    100
                ) / 100}
              </span>{" "}
              kda
            </div>
            <div className="other">
              {currentProfileMatchTotalCs} cs (
              {Math.round(
                (currentProfileMatchTotalCs / (match.info.gameDuration / 60)) *
                  10
              ) / 10}
              )
            </div>
            <div className="other">
              {currentProfileMatchData.visionScore} vision
            </div>
          </div>

          {/* Items */}
          <div className="item-icons-container">
            {[
              currentProfileMatchData.item0,
              currentProfileMatchData.item1,
              currentProfileMatchData.item2,
              currentProfileMatchData.item6,
              currentProfileMatchData.item3,
              currentProfileMatchData.item4,
              currentProfileMatchData.item5,
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.17.1/img/item/${item}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  width: "26px",
                  height: "26px",
                  borderRadius: "5px",
                  margin: "1px",
                  backgroundColor: iconBackgroundColor,
                }}
              />
            ))}
          </div>

          {/* Match Champions */}
          <div className="champion-icons-container">
            {matchParticipants.map((participant, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  rowGap: "5px",
                  height: "16px",
                }}
              >
                <div
                  style={{
                    backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${participant.championName}.png)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "13px",
                    height: "13px",
                    borderRadius: "2px",
                  }}
                />
                <p className="champion-names">
                  {participant.riotIdGameName.length > 7
                    ? participant.riotIdGameName.substring(0, 7) + "..."
                    : participant.riotIdGameName}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {matches}
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
        backgroundColor: "lightblue",
      }}
    >
      <h1>League of Legends API Website</h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <form onSubmit={fetchProfileData}>
          <input
            type="text"
            placeholder="SummonerName#TagLine"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
            style={{
              height: "17px",
            }}
          />
        </form>

        <button
          type="submit"
          onClick={fetchProfileData}
          className="search-button"
        >
          🔎
        </button>
      </div>

      <h2>Profile Data:</h2>

      {loading && <p>Loading...</p>}

      {!loading && profileData && <MatchDetails profileData={profileData} />}

      {!loading && !profileData && <p>No Data Found</p>}
    </div>
  );
}

export default App;
