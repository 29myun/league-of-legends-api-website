import express from "express";
import cors from "cors";
import dotenv from "dotenv";
<<<<<<< HEAD
import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";
=======
import { formatSeconds } from "./utils/time.js"
>>>>>>> 473b3731b00b0a12a685d5ea6f14c080065e6d51

dotenv.config();

const app = express();

<<<<<<< HEAD
const port = process.env.PORT || 5069;
const riotApiKey = process.env.RIOT_API_KEY;

if (!riotApiKey) {
  console.error("RIOT_API_KEY environment variable is not set!");
  process.exit(1);
}

=======
const port = 5000;
const riotApiKey = "RGAPI-5068eac1-79d7-4ce0-bc90-d43557b7b40a";

>>>>>>> 473b3731b00b0a12a685d5ea6f14c080065e6d51
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.get("/", async (req, res) => {
  res.json(`My League of Legends API express server running on PORT ${port}`);
});

app.get("/match-history", async (req, res) => {
  const profileData = {};

<<<<<<< HEAD
  try {
    const rAPI = new RiotAPI(riotApiKey);

    const account = await rAPI.account.getByRiotId({
      region: PlatformId.AMERICAS,
      gameName: req.query.gameName,
      tagLine: req.query.tagLine,
    });

    profileData.gameName = account.gameName;
    profileData.tagLine = account.tagLine;
    profileData.puuid = account.puuid;

    const summoner = await rAPI.summoner.getByPUUID({
      region: PlatformId.NA1,
      puuid: account.puuid,
    });

    profileData.summonerLevel = summoner.summonerLevel;

    const matchIds = await rAPI.matchV5.getIdsByPuuid({
      cluster: PlatformId.AMERICAS,
      puuid: account.puuid,
      params: {
        start: 0,
        count: 10,
        queue: 420,
      },
    });

    profileData.matches = [];

    for (let i = 0; i < matchIds.length; i++) {
      const match = await rAPI.matchV5.getMatchById({
        cluster: PlatformId.AMERICAS,
        matchId: matchIds[i],
=======
  const riotApiBaseUrl = "https://americas.api.riotgames.com";
  const accountByRiotIdUrl = `${riotApiBaseUrl}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  let puuid;

  // Fetch puuid
  try {
    const response = await fetch(accountByRiotIdUrl, {
      headers: {
        "X-Riot-Token": riotApiKey,
      },
    });
    const data = await response.json();
    puuid = data.puuid;
    if (!puuid) {
      return res.status(404).json({
        error: `puuid not found gameName: ${gameName} tagLine: ${tagLine}`,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch puuid" });
  }

  // Fetch match ids
  let matchIdList;
  const matchIdListUrl = `${riotApiBaseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
  try {
    const response = await fetch(matchIdListUrl, {
      headers: {
        "X-Riot-Token": riotApiKey,
      },
    });
    matchIdList = await response.json();
    if (!Array.isArray(matchIdList) || matchIdList.length === 0) {
      return res.status(404).json({ error: "No match ids found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch match ids" });
  }

  // Fetch match data
  let matchId = matchIdList[0];
  const matchDetailsUrl = `${riotApiBaseUrl}/lol/match/v5/matches/${matchId}`;
  let matchMetadata, matchInfo, matchData;
  try {
    const response = await fetch(matchDetailsUrl, {
      headers: {
        "X-Riot-Token": riotApiKey,
      },
    });
    matchData = await response.json();
    matchMetadata = matchData.metadata;
    matchInfo = matchData.info;
    if (!matchMetadata || !matchMetadata["participants"]) {
      return res.status(404).json({ error: "No match metadata found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch match data" });
  }

  // Fetch and create a new object with some data of each participant
  const participantPuuids = matchMetadata["participants"];
  let participantsDataSummary = [];
  let trueSide;
  try {
    for (let i = 0; i < participantPuuids.length; i++) {
      const accountByPuuidUrl = `${riotApiBaseUrl}/riot/account/v1/accounts/by-puuid/${participantPuuids[i]}`;
      const response = await fetch(accountByPuuidUrl, {
        headers: {
          "X-Riot-Token": riotApiKey,
        },
      });
      let data = await response.json();
      if (i > 4) {
        trueSide = "Blue";
      } else {
        trueSide = "Red";
      }
      let participantData = matchInfo.participants[i]
      participantsDataSummary.push({
        gameName: data.gameName,
        tagLine: data.tagLine,
        trueSide: trueSide,
        championPlayed: participantData.championName,
        kills: participantData.kills,
        deaths: participantData.deaths,
        assists: participantData.assists,
        items: [participantData.item0, participantData.item1, participantData.item2, participantData.item3, participantData.item4, participantData.item5, participantData.item6],
        summonerSpells: [participantData.summoner1Id, participantData.summoner2Id]
>>>>>>> 473b3731b00b0a12a685d5ea6f14c080065e6d51
      });

      profileData.matches.push(match);
    }
<<<<<<< HEAD

    return res.json(profileData);
=======
>>>>>>> 473b3731b00b0a12a685d5ea6f14c080065e6d51
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch profile data",
      details: error.message,
    });
  }

  let winningTeam;

  if (matchInfo.teams[0].winning) {
    winningTeam = "blue"
  } else {
    winningTeam = "red"
  }

  const startTime = matchData.info.gameStartTimestamp; // e.g., 1693850000000
  const date = new Date(startTime); // Convert to JS Date object

  let matchDataSummary = {}
  matchDataSummary.matchDuration = formatSeconds(matchInfo.gameDuration)
  matchDataSummary.gameMode = matchInfo.queueId
  matchDataSummary.winningTeam = winningTeam
  matchDataSummary.participantsDataSummary = participantsDataSummary
  
  return res.json(matchDataSummary)
});

app.listen(port);
