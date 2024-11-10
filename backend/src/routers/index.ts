import express from "express";
import authRoute from "./authRoute";
import mqttRoute from "./mqttRoute";

const router = express.Router();

const routesHandler = (): express.Router => {
  authRoute(router);
  mqttRoute(router);

  return router;
};

export default routesHandler;
