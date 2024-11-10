import mqtt from "mqtt";
import { sendToQueue } from "./rabbitMQ/rabbitMQInstance";

let client: mqtt.MqttClient;

const options = {
  host: "a290b9bc05ee4afdbc18a2fd30f92d28.s1.eu.hivemq.cloud",
  port: 8884,
  protocol: "wss",
  username: "thanh",
  password: "123",
  path: "mqtt",
};

// Connect to the MQTT broker
client = mqtt.connect(
  `${options.protocol}://${options.host}:${options.port}/${options.path}`,
  {
    username: options.username,
    password: options.password,
  }
);

async function connectToMQTT() {
  client.on("connect", () => {
    console.log("Connected to MQTT broker");

    const topics = ["esp32/Light_Data_BH1750", "esp32/led_1", "esp32/led_2"];

    client.subscribe(topics, (err) => {
      if (err) {
        console.error("Error subscribing to topics:", err);
      } else {
        console.log("Successfully subscribed to topics:", topics);
      }
    });
  });

  client.on("message", (topic, message) => {
    try {
      // console.log("topic: " + topic);
      // console.log("message: " + message);
      const data = JSON.parse(message.toString());
      const currentTime = new Date().toLocaleTimeString();

      // topic: esp32/Light_Data_BH1750
      // message: {"light":22.5}
      // topic: esp32/led_1
      // message: {"status":"on","brightness":9,"lightIntensity":25,"motionStatus":"No motion detected!"}

      const payload = {
        motherboard: "",
        device: "",
        status: "",
        brightness: 0,
        lightIntensity: 0,
        motionStatus: "",
        light: 0,
      };

      const [motherboard, device] = topic.split("/");
      switch (topic) {
        case "esp32/Light_Data_BH1750":
          payload.light = data.light;
          payload.device = device;
          payload.motherboard = motherboard;

          sendToQueue(payload);
          break;
        case "esp32/led_1":
          payload.device = device;
          payload.motherboard = motherboard;
          payload.brightness = data.brightness;
          payload.status = data.status;
          payload.lightIntensity = data.lightIntensity;
          payload.motionStatus = data.motionStatus;

          // Send the message to rabbitMQ
          sendToQueue(payload);
          break;
        case "esp32/led_2":
          break;

        default:
          return;
      }
    } catch (err) {
      console.error("Error processing MQTT message: " + err.message);
    }
  });
}

export default { connectToMQTT, client };
