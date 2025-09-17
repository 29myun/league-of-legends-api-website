import express from "express";
import cors from "cors";
import profileRoute from "./routes/profile.js";

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

app.listen(port);
