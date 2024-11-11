import {
  toggleLight,
  changeBrightness,
  lightSchedule,
} from "../controllers/mqttController";
import express from "express";

const mqttRoute = (router: express.Router) => {
  router.post("/changeLight", toggleLight);
  router.post("/changeSchedule", lightSchedule);
  router.post("/changeBrightness", changeBrightness);
};

export default mqttRoute;
