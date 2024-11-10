import express from "express";
import database from "./database";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";

import connectToMQTT from "./mqttClient";
import { connectRabbitMQ } from "./rabbitMQ/rabbitMQInstance";
import { startWorker } from "./workers/rabbitmqWorker";

// Cofig .env file
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

// Connect to mongoDB
database.connect();

// Create HTTP server
const server = http.createServer(app);
server.listen(8087, () => {
  console.log("Server is running on port 8087");
});

// TODO: Create socket server

async function handleMqttData() {
  // Receive data from MQTT
  await connectToMQTT();

  // Connect to RabbitMQ to create message queue
  await connectRabbitMQ();

  // create a worker to only save data to Mongo every 5 minutes
  await startWorker();
}

handleMqttData();

// handle exceptio error
process.on("SIGINT", async () => {
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.log(error);
  process.exit(1);
});
