import rabbit from "amqplib";

let channel: rabbit.Channel;

async function connectRabbitMQ() {
  try {
    const connection = await rabbit.connect("amqp://localhost");
    channel = await connection.createChannel();

    // Create queue
    await channel.assertQueue("iotDataChannel", { durable: true });

    console.log("Connect to RabbitMQ");
  } catch (err) {
    console.error("rabbitMQ connection error: " + err);
  }
}

async function sendToQueue(message: any) {
  if (channel) {
    channel.sendToQueue(
      "iotDataChannel",
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      }
    );
  } else {
    console.log(
      "RabbitMQ channel is not available! Please run the RabbitMQ instance in Docker 😁"
    );
  }
}

export { sendToQueue, connectRabbitMQ };
