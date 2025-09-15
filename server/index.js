import express from "express";
import cors from "cors";
import profileRoute from "./routes/profile.js";
import championsRoute from "./routes/champions.js";
import itemsRoute from "./routes/items.js";


const app = express();
const port = 5050;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/api", async (req, res) => {
  res.json(`My League of Legends API express server running on PORT ${port}`);
});

app.use("/api/profile", profileRoute);
app.use("/api/champions", championsRoute);
app.use("/api/items", itemsRoute);

app.listen(port);
