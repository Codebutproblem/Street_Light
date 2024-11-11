import express from "express";
import mqttClient from "../mqttClient";

const topicArr = [
  "esp32/led_1/change_status",
  "esp32/led_1/change_schedule",
  "esp32/led_1/change_brightness",
];

export const toggleLight = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { status } = req.body;
    const payload = {
      status,
    };

    mqttClient.client.publish(topicArr[0], JSON.stringify(payload), (error) => {
      if (error) {
        console.error("Publish error:", error);
        res.status(500).json({
          message: "Error publishing message",
        });
      } else {
        res.status(200).send({ message: "Message published successfully" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error publishing message",
    });
  }
};

export const lightSchedule = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { start, end } = req.body;
    const payload = {
      start,
      end,
    };

    mqttClient.client.publish(topicArr[1], JSON.stringify(payload), (error) => {
      if (error) {
        console.error("Publish error:", error);
        res.status(500).json({
          message: "Error publishing message",
        });
      } else {
        res.status(200).send({ message: "Message published successfully" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error publishing message",
    });
  }
};

export const changeBrightness = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { brightness } = req.body;
    const payload = {
      brightness,
    };

    mqttClient.client.publish(topicArr[2], JSON.stringify(payload), (error) => {
      if (error) {
        console.error("Publish error:", error);
        res.status(500).json({
          message: "Error publishing message",
        });
      } else {
        res.status(200).send({ message: "Message published successfully" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error publishing message",
    });
  }
};
