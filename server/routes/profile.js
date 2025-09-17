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

    cache.set(cacheKey, {
      data: profileData,
      timestamp: Date.now(),
    });

    let profileChampionData = {};

    for (let i = 0; i < profileData.matches.length; i++) {
      const currentMatch = (profileData.matches[i].info.participants).find((participant) => participant.riotIdGameName === profileData.gameName)
      const championName = currentMatch.championName

      if (!(championName in profileChampionData))
      profileChampionData[championName] = {
        totalWins: 0,
        totalLosses: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        nGames: 0,
      };

      if (currentMatch.win) {
        profileChampionData[championName].totalWins += 1;
      } else {
        profileChampionData[championName].totalLosses += 1;
      };

      profileChampionData[championName].totalKills += currentMatch.kills;
      profileChampionData[championName].totalDeaths += currentMatch.deaths;
      profileChampionData[championName].totalAssists += currentMatch.assists;
      profileChampionData[championName].nGames += 1;
    }
    
    Object.entries(profileChampionData).forEach(([championName, data]) => {
      data.avgKillsPerGame = (data.totalKills / data.nGames).toFixed(1)
      data.avgDeathsPerGame = (data.totalDeaths / data.nGames).toFixed(1)
      data.avgAssistsPerGame = (data.totalAssists / data.nGames).toFixed(1)
      data.avgKDA = Math.round((Number(data.totalKills) + Number(data.totalAssists)) / Number(data.totalDeaths) * 10) / 10
      data.winrate = Math.round((data.totalWins / (data.totalWins + data.totalLosses)) * 100)
    })

    let profileTotalKills = 0;
    let profileTotalAssists = 0;
    let profileTotalDeaths = 0;

    Object.values(profileChampionData).forEach(champion => {
      profileTotalKills += champion.totalKills
      profileTotalAssists += champion.totalAssists
      profileTotalDeaths += champion.totalDeaths
    })

    profileData.avgKDA = Math.round(((profileTotalKills + profileTotalAssists) / profileTotalDeaths) * 10) / 10
    profileData.avgKillsPerGame = Math.round((profileTotalKills / profileData.matches.length) * 10) / 10;
    profileData.avgDeathsPerGame = Math.round((profileTotalDeaths / profileData.matches.length) * 10) / 10;
    profileData.avgAssistsPerGame = Math.round((profileTotalAssists / profileData.matches.length) * 10) / 10;

    profileData.profileChampionData = profileChampionData

    return res.json(profileData);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch profile data",
      details: error.message,
    });
  }
});

export default router;
