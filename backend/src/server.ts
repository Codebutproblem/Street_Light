import express from "express";
import database from "./database";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";

import connectToMQTT from "./mqttClient";
import { connectRabbitMQ } from "rabbitMQ/rabbitMQInstance";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json());

database.connect();

const server = http.createServer(app);
server.listen(8087, () => {
  console.log("Server is running on port 8087");
});

connectToMQTT();
connectRabbitMQ();

process.on("SIGINT", async () => {
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.log(error);
  process.exit(1);
});
