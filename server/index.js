import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";

dotenv.config();

const app = express();

const port = process.env.PORT || 5069;
const riotApiKey = process.env.RIOT_API_KEY;

if (!riotApiKey) {
  console.error("RIOT_API_KEY environment variable is not set!");
  process.exit(1);
}

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
      });

      profileData.matches.push(match);
    }

    return res.json(profileData);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch profile data",
      details: error.message,
    });
  }
});

app.listen(port);
