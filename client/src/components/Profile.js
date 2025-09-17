import React, { useState } from "react";
import { formatSeconds, getTimeAgo } from "../utils/time";
import { summonerSpellIds, perkIds, queueIds } from "../utils/ids";
import "../styles/profile.css";

const PROFILE_SERVER_PORT = 5050;

export default function Profile() {
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
        `http://localhost:${PROFILE_SERVER_PORT}/api/profile?gameName=${encodeURIComponent(
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

  const handlePlayerClick = async (riotIdGameName, riotIdTagline) => {
    setSearchTerm(riotIdGameName + "#" + riotIdTagline);

    if (!searchTerm) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:${PROFILE_SERVER_PORT}/profile?gameName=${encodeURIComponent(
          riotIdGameName
        )}&tagLine=${encodeURIComponent(riotIdTagline)}`
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

  const ProfileDetails = ({ profileData }) => {
    const rankedSoloDuo = profileData.rankedSoloDuo;

    return (
      <>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "42px",
            marginLeft: "1px",
          }}
        >
          <div>
            <div
              style={{
                width: "75px",
                height: "75px",
                backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.17.1/img/profileicon/${profileData.profileIconId}.png)`,
                backgroundSize: "cover",
                border: "2px solid black",
                borderRadius: "5px",
              }}
            />
          </div>
          <div>
            <h1 style={{ height: "14px" }}>
              {profileData.gameName}{" "}
              <span style={{ color: "rgba(240, 255, 255, 0.8)", fontSize: "24px"}}>
                #{profileData.tagLine}
              </span>
            </h1>
            <h3>lvl {profileData.summonerLevel}</h3>
          </div>
        </div>
        <div
          style={{
            width: "700px",
            height: "100px",
            display: "flex",
            alignItems: "center",
            borderRadius: "4px",
            marginBottom: "5px",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "500",
            fontSize: "14px",
            backgroundColor: "rgb(25, 25, 55)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "20px", marginLeft: "24px"}}>
            <div
              style={{
                width: "76.7px",
                height: "56.7px",
                backgroundImage: `url(/images/rank-emblems/${profileData.rankedSoloDuo.tier.toLowerCase()}.png)`,
                backgroundSize: "cover",

              }}
            />
            <div
              style={{
                width: "170px",
              }}
            >
              <p
                style={{
                  color: "white",
                  fontWeight: "550",
                  fontSize: "20px",
                  height: "4px",
                }}
              >
                {rankedSoloDuo.tier.charAt(0) +
                  rankedSoloDuo.tier.substring(1).toLowerCase()}{" "}
                {rankedSoloDuo.rank}
              </p>
              <p>{rankedSoloDuo.leaguePoints} LP</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: "65px", textAlign: "center", width: "100px" }}>
            <span style={{ fontWeight: "bold", fontSize: "16px"}}>{profileData.avgKDA} KDA</span>
            <span style={{ fontSize: "14px" }}>{profileData.avgKillsPerGame} <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>/</span> {profileData.avgDeathsPerGame} <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>/</span> {profileData.avgAssistsPerGame}</span>
          </div>

          <div
            style={{
              textAlign: "right",
              marginLeft: "120px"
            }}
          >
            <p style={{ height: "4px"}}>
              {rankedSoloDuo.wins}W {rankedSoloDuo.losses}L
            </p>
            <p>
              {`${(
                rankedSoloDuo.wins /
                (rankedSoloDuo.wins + rankedSoloDuo.losses)
              ).toFixed(2)}`.substring(2)}
              % Win Rate
            </p>
          </div>
        </div>
      </>
    );
  };

  const MatchDetails = ({ profileData }) => {
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
      let iconBackgroundColor = "rgba(255, 255, 255, 0.15)";

      if (currentProfileMatchData.win) {
        winOrLoss = "WIN";
        winOrLossColor = "rgba(0, 100, 255, 1)";
        matchBackgroundColor = "rgba(0, 125, 255, 0.3)";
      } else {
        winOrLoss = "LOSS";
        winOrLossColor = "rgba(255, 0, 0, 1)";
        matchBackgroundColor = "rgb(69, 25, 43)";
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
            <div style={{ fontSize: "12px" }}>
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
                  backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${currentProfileMatchData.championName}.png)`,
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
                <p
                  className="champion-names"
                  onClick={() =>
                    handlePlayerClick(
                      participant.riotIdGameName,
                      participant.riotIdTagline
                    )
                  }
                >
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
  };

  const ProfileChampionDetails = ({ profileData }) => {
    const profileChampionData = profileData.profileChampionData;

    let champions = []

    Object.entries(profileChampionData).forEach(([championName, data]) => {
      let kdaColor;
      if (data.avgKDA < 1) {
        kdaColor = "#ff4e50";
      } else if (data.avgKDA >= 3) {
        kdaColor = "#3273fa";
      } else {
        kdaColor = "white";
      }
      
      let winrateColor;
      if (data.winrate < 50) {
        winrateColor = "#ff4e50";
      } else if (data.winrate >= 50 && data.winrate < 75) {
        winrateColor = "#3273fa";
      } else if (data.winrate >= 75 && data.winrate <= 100) {
        winrateColor = "#ff9b00";
      } else {
        winrateColor = "white";
      }      

      champions.push(
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            backgroundColor: "rgb(25, 25, 55)",
            borderRadius: "4px",
            width: "375px",
            height: "60px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100px"}}>
            <div
              style={{
                backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${championName}.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "40px",
                height: "40px",
              }}
            />
            <span style={{ fontSize: "12px" }}>{championName}</span>  
          </div>

          <div style={{ display: "flex", flexDirection: "column", textAlign: "center", width: "100px"}}>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: kdaColor}}>{data.avgKDA} KDA</span>
              <span style={{ fontSize: "12px" }}>{data.avgKillsPerGame} <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>/</span> {data.avgDeathsPerGame} <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>/</span> {data.avgAssistsPerGame}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: "60px", fontSize: "14px", textAlign: "right"}}>
              <span style={{ color: winrateColor, fontWeight: "bold"}}>{data.winrate}%</span>
              <span style={{ fontSize: "12px" }}>{data.nGames} games</span> 
          </div>
        </div>
      )
    })

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {champions}
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "48px",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex" }}>
          <form onSubmit={fetchProfileData}>
            <input
              type="text"
              placeholder="SummonerName#TagLine"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{
                height: "36px",
                width: "400px",
                border: "none",
                outline: "none",
                backgroundColor: "rgb(13, 13, 40)",
                paddingLeft: "20px",
                color: "rgba(255, 255, 255, 0.75)",
                boxShadow: "8px 4px 8px rgba(0, 0, 0, 0.4)",
              }}
            />
          </form>

          <button
            type="submit"
            onClick={fetchProfileData}
            className="search-button"
            style={{
              border: "none",
              backgroundColor: "white",
              height: "38px",
              boxShadow: "8px 4px 8px rgba(0, 0, 0, 0.4)",
              backgroundColor: "rgb(13, 13, 40)",
            }}
          >
            🔍
          </button>
        </div>
        <div>
          {loading && <p style={{ marginTop: "36vh" }}>Loading...</p>}
          {!loading && !profileData && <p style={{ marginTop: "36vh" }}>No Data Found</p>}
        </div>
      </div>
      {!loading && profileData && (
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div>
            <ProfileDetails profileData={profileData} />
            <MatchDetails profileData={profileData} />
          </div>
          <div
            style={{
              marginTop: "245px",
            }}
          >
            <ProfileChampionDetails profileData={profileData} />
          </div>
        </div>
      )}
    </>
  );
}
