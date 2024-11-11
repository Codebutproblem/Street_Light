import { login, signUp } from "../controllers/authController";
import express from "express";

const authRoute = (router: express.Router) => {
  router.post("/signup", signUp);
  router.post("/signin", login);

  return router;
};

export default authRoute;
