import express from "express";
import cors from "cors";
import dotenv from "dotenv"

dotenv.config();

const app = express();

const PORT = 5000;
const riot_api_key = "RGAPI-5068eac1-79d7-4ce0-bc90-d43557b7b40a";

app.use(cors({
  origin:"http://localhost:3000"
}));

app.use(express.json());

app.get("/", async (req, res) => {
  res.json("My League of Legends API express server running on PORT " + PORT);
});

app.get("/profile", async (req, res) => {
  const gameName = req.query.gameName;
  const tagLine = req.query.tagLine;

  const URL = "https://americas.api.riotgames.com";
  const puuid_from_summoner_name_and_tagline_url = `${URL}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  let puuid;

  // Fetch puuid
  try {
    const response = await fetch(puuid_from_summoner_name_and_tagline_url, {
      headers: {
        "X-Riot-Token": riot_api_key,
      },
    });
    const data = await response.json();
    puuid = data.puuid;
    if (!puuid) {
      return res.status(404).json({ error: `puuid not found gameName: ${gameName} tagLine: ${tagLine}` });    
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch puuid" });
  }

  // Fetch match ids
  let match_ids;
  const match_ids_url = `${URL}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
  try {
    const response = await fetch(match_ids_url, {
      headers: {
        "X-Riot-Token": riot_api_key,
      },
    });
    match_ids = await response.json();
    if (!Array.isArray(match_ids) || match_ids.length === 0) {
      return res.status(404).json({ error: "No match ids found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch match ids" });
  }

  // Fetch match data
  let match = match_ids[0];
  const match_data_url = `${URL}/lol/match/v5/matches/${match}`;
  let metadata, info, match_data;
  try {
    const response = await fetch(match_data_url, {
      headers: {
        "X-Riot-Token": riot_api_key,
      },
    });
    match_data = await response.json();
    metadata = match_data.metadata;
    info = match_data.info;
    if (!metadata || !metadata["participants"]) {
      return res.status(404).json({ error: "No match metadata found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch match data" });
  }

  // Fetch participants' gamename and tagline
  const match_participants_by_puuid = metadata["participants"];
  let match_participants = [];
  try {
    for (let i = 0; i < match_participants_by_puuid.length; i++) {
      const account_by_puuid_url = `${URL}/riot/account/v1/accounts/by-puuid/${match_participants_by_puuid[i]}`;
      const response = await fetch(account_by_puuid_url, {
        headers: {
          "X-Riot-Token": riot_api_key,
        },
      });
      let data = await response.json();
      match_participants.push({
        gameName: data.gameName,
        tagLine: data.tagLine
      });
    }
    return res.json(match_participants);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch match participants" });
  }
});

app.listen(PORT);
