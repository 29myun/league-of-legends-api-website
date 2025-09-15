import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/15.17.1/data/en_US/item.json"
    );
    const data = await response.json();

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch champion data",
      details: error.message,
    });
  }
});

export default router;
