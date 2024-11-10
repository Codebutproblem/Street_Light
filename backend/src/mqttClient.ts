import mqtt from "mqtt";

function connectToMQTT() {
  const options = {
    host: "a290b9bc05ee4afdbc18a2fd30f92d28.s1.eu.hivemq.cloud",
    port: 8884,
    protocol: "wss",
    username: "thanh",
    password: "123",
    path: "mqtt",
  };

  // Connect to the MQTT broker
  const client = mqtt.connect(
    `${options.protocol}://${options.host}:${options.port}/${options.path}`,
    {
      username: options.username,
      password: options.password,
    }
  );

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
      console.log("topic: " + topic);
      console.log("message: " + message);
      const data = JSON.parse(message.toString());
      const currentTime = new Date().toLocaleTimeString();

      switch (topic) {
        case "esp32/Light_Data_BH1750":
          break;
        case "esp32/led_1":
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

export default connectToMQTT;
