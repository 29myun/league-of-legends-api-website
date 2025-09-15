import express from "express";
import { RiotAPI, PlatformId } from "@fightmegg/riot-api";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const riotApiKey = process.env.RIOT_API_KEY;
const rAPI = new RiotAPI(riotApiKey);

router.get("/", async (req, res) => {
  const profileData = {};

  const cacheKey = `${req.query.gameName}#${req.query.tagLine}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.json(cachedData.data);
    }

    cache.delete(cacheKey);
  }

  try {
    const account = await rAPI.account.getByRiotId({
      region: PlatformId.AMERICAS,
      gameName: req.query.gameName,
      tagLine: req.query.tagLine,
    });

    profileData.gameName = account.gameName;
    profileData.tagLine = account.tagLine;
    profileData.puuid = account.puuid;

    const rankedData = await rAPI.league.getEntriesByPUUID({
      region: PlatformId.NA1,
      puuid: account.puuid,
    });

    for (let i = 0; i < rankedData.length; i++) {
      if (
        rankedData[i].queueType === "RANKED_SOLO_5x5" &&
        !("rankedSoloDuo" in profileData)
      ) {
        profileData.rankedSoloDuo = rankedData[i];
      } else if (
        rankedData[i].queueType === "RANKED_FLEX_SR" &&
        !("rankedFlex" in profileData)
      ) {
        profileData.rankedFlex = rankedData[i];
      }
    }

    const summoner = await rAPI.summoner.getByPUUID({
      region: PlatformId.NA1,
      puuid: account.puuid,
    });

    profileData.summonerLevel = summoner.summonerLevel;
    profileData.profileIconId = summoner.profileIconId;

    const matchIds = await rAPI.matchV5.getIdsByPuuid({
      cluster: PlatformId.AMERICAS,
      puuid: account.puuid,
      params: {
        start: 0,
        count: 5,
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

    cache.set(cacheKey, {
      data: profileData,
      timestamp: Date.now(),
    });

    return res.json(profileData);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch profile data",
      details: error.message,
    });
  }
});

export default router;
