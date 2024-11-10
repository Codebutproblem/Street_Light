import { toggleLight } from "../controllers/mqttController";
import express from "express";

const mqttRoute = (router: express.Router) => {
  router.post("/lightToggle", toggleLight);
};

export default mqttRoute;
