import rabbit from "amqplib";
import Device from "../model/deviceModel";
import LightData from "../model/lightDataModel";

type DeviceType = {
  motherboard: string;
  device: string;
  status?: string;
  brightness?: number;
  lightIntensity?: number;
  motionStatus?: string;
  light?: number;
};

// Sử dụng object như một chỗ nhớ tạm thời khi nhận dự liệu từ rabbitMQ
// Sau đó cứ 5 phút sẽ vào kiểm tra object và cập nhật object vào DB theo key name
// Luồng hoạt động: MQTT => RabbitMQ => Worker => MongoDB
let bufferData: { [deviceName: string]: DeviceType } = {};

async function storeDeviceData() {
  for (const [deviceName, data] of Object.entries(bufferData)) {
    // console.log(deviceName, data);

    try {
      switch (deviceName) {
        case "Light_Data_BH1750":
          let lightData = await LightData.findOne({ name: deviceName });

          if (lightData?.id) {
            lightData.light_level = data.light;
            lightData.timestamp = new Date().toISOString();

            await lightData.save();
            console.log(`lightData updated: ${deviceName}`);
          } else {
            const newLightData = new LightData({
              name: deviceName,
              light_level: data.light,
            });
            await newLightData.save();
            console.log(`lightData created: ${deviceName}`);
          }

          break;

        case "led_1":
          let device = await Device.findOne({
            deviceName,
          });

          if (device?.id) {
            device.status = data.status;
            device.brightness = data.brightness;
            device.lightIntensity = data.lightIntensity;
            device.deviceName = data.device;
            device.updatedAt = new Date().toISOString();

            await device.save();
            console.log(`device updated: ${deviceName}`);
          } else {
            const newDevice = new Device({
              deviceName,
              status: data.status || "off",
              brightness: data.brightness || 0,
              lightIntensity: data.lightIntensity || 0,
              device: data.device,
            });

            await newDevice.save();
            console.log(`New device created: ${deviceName}`);
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.error("Error storing device data:", err);
    }
  }
}

/////////////////////////////////////////////////

// Handle message
async function processMessage(mes: rabbit.ConsumeMessage) {
  const {
    motherboard,
    device,
    status,
    brightness,
    lightIntensity,
    motionStatus,
    light,
  } = JSON.parse(mes.content.toString());

  bufferData[device] = {
    device,
    motherboard,
    status,
    brightness,
    lightIntensity,
    motionStatus,
    light,
  };
}

//////////////////////////////////////////////////

// Start the worker
export async function startWorker() {
  try {
    const connection = await rabbit.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue("iotDataChannel", { durable: true });
    console.log("Worker connected to rabbitMQ and waiting...");

    channel.consume(
      "iotDataChannel",
      async (mes) => {
        if (mes != null) {
          await processMessage(mes);
        }
        channel.ack(mes);
      },
      { noAck: false }
    );

    setInterval(storeDeviceData, 5 * 1000);
  } catch (err) {
    console.error("Worker failed to connect to RabbitMQ");
  }
}
