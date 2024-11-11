import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale, // Import the necessary Chart.js components
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import mqtt from "mqtt";
import axios from "axios";

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

import { io } from "socket.io-client";

const Dashboard = () => {
  const [lights, setLights] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [mqttClient, setMqttClient] = useState(null);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [brightness, setBrightness] = useState(0);

  useEffect(() => {
    // Set up the socket connection
    const socket = io("http://localhost:8087", {
      withCredentials: true,
      reconnection: true,
      transports: ["websocket"],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 10000,
      reconnectionDelayMax: 20000,
      auth: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MzE1Yjc2MWZjOTUxNGFkNzM0NDAxNSIsInVzZXJuYW1lIjoia2hvaSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMxMjg3OTQwLCJleHAiOjQzMjMyODc5NDB9.20SvjSNfeM5VNRbUteA6kyO0OFj0XeXlJcfHFnfj5Gc",
      },
    });

    // Fallback function if the socket is unavailable
    function triggerFallback() {
      setFallbackTriggered(true);
      console.warn("Socket is unavailable!");
    }

    socket.on("connect", () => {
      console.log("Connected to socket server");
      setFallbackTriggered(false);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      triggerFallback();
    });

    socket.on("connect_error", (error) => {
      console.log("Connection error: " + error.message);
      triggerFallback();
    });

    socket.on("reconnect_failed", () => {
      console.log("Reconnect failed");
      triggerFallback();
    });

    socket.on("IOT_BH1750", (data) => {
      console.log("Sensor data received:", data);

      const timestamp = new Date().toLocaleTimeString();
      const newDataPoint = {
        x: timestamp,
        y: data.light,
      };

      setTimeSeries((prev) => [...prev, newDataPoint]);
      setSensorData((prev) => [...prev, data]);
    });

    socket.on("IOT_LED_1", (data) => {
      console.log("Light data received:", data);
      setLights((prev) => {
        const updatedLights = prev.map((light) => {
          if (light.device === data.device) {
            return {
              ...light,
              ...data,
            };
          }
          return light;
        });
        if (!updatedLights.some((light) => light.device === data.device)) {
          updatedLights.push(data);
        }
        return updatedLights;
      });
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection on component unmount
    };
  }, []); // Empty array means this effect runs only once when the component mounts

  const toggleLight = (device) => {
    let updatedStatus; // Define the updatedStatus here

    // Toggle light status immediately in the UI (optimistic update)
    setLights((prev) => {
      const updatedLights = prev.map((light) => {
        if (light.device === device) {
          updatedStatus = light.status === "on" ? "off" : "on"; // Set updatedStatus here
          return { ...light, status: updatedStatus };
        }
        return light;
      });
      return updatedLights;
    });

    // Send request to change light status
    axios
      .post("http://localhost:8087/api/v1/changeLight", {
        status: updatedStatus,
      })
      .then(() => {
        // Emit socket event if the API request succeeds
        console.log("SUCCESS");
        // socket.emit("toggle_light", { device, status: updatedStatus });
      })
      .catch((error) => {
        // If there's an error, revert the UI change
        console.error("Error changing light status:", error);
        setLights((prev) => {
          const updatedLights = prev.map((light) => {
            if (light.device === device) {
              const currentStatus = light.status === "on" ? "off" : "on";
              return { ...light, status: currentStatus }; // Revert change
            }
            return light;
          });
          return updatedLights;
        });
      });
  };

  // Handle start and end time changes
  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const handleBrightness = (e) => {
    setBrightness(e.target.value);
  };
  // useEffect(() => {
  //   const options = {
  //     host: "a290b9bc05ee4afdbc18a2fd30f92d28.s1.eu.hivemq.cloud",
  //     port: 8884,
  //     protocol: "wss",
  //     username: "thanh",
  //     password: "123",
  //     path: "mqtt",
  //   };

  //   // Connect to the MQTT broker
  //   const client = mqtt.connect(
  //     `${options.protocol}://${options.host}:${options.port}/${options.path}`,
  //     {
  //       username: options.username,
  //       password: options.password,
  //     }
  //   );

  //   setMqttClient(client);

  //   client.on("connect", () => {
  //     const topics = ["esp32/Light_Data_BH1750", "esp32/led_1", "esp32/led_2"];

  //     client.subscribe(topics, (err) => {
  //       if (err) {
  //         console.error("Error subscribing to topics:", err);
  //       } else {
  //         console.log("Successfully subscribed to topics:", topics);
  //       }
  //     });
  //   });

  //   client.on("message", (topic, message) => {
  //     try {
  //       const data = JSON.parse(message.toString());
  //       const currentTime = new Date().toLocaleTimeString();

  //       if (topic === "esp32/Light_Data_BH1750") {
  //         setSensorData((prevData) => [
  //           ...prevData,
  //           { time: currentTime, value: data.light },
  //         ]);
  //         setTimeSeries((prevSeries) => [
  //           ...prevSeries.slice(-9),
  //           { x: currentTime, y: data.light },
  //         ]);
  //       } else if (topic.startsWith("esp32/led")) {
  //         const ledNumber = parseInt(
  //           topic.split("/")[1].replace("led_", ""),
  //           10
  //         );

  //         setLights((prevLights) =>
  //           prevLights.map((light) => {
  //             console.log(light?.motionStatus);
  //             if (light.id === ledNumber) {
  //               return {
  //                 ...light,
  //                 status: data.status === "on",
  //                 brightness: data.brightness || light.brightness,
  //                 lightIntensity: data.lightIntensity || light.lightIntensity,
  //                 motionStatus: data.motionStatus || light.motionStatus,
  //               };
  //             }
  //             return light;
  //           })
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error processing message:", error);
  //     }
  //   });

  //   return () => {
  //     if (client) {
  //       client.end();
  //     }
  //   };
  // }, []);

  const chartData = {
    labels: timeSeries.map((data) => data?.x),
    datasets: [
      {
        label: "Sensor Data",
        data: timeSeries.map((data) => data?.y),
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgba(255, 255, 255, 1)",
          font: {
            size: 14,
            family: "Arial, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Thời gian",
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 16,
            family: "Arial, sans-serif",
          },
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cường độ ánh sáng",
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 16,
            family: "Arial, sans-serif",
          },
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          min: 0,
          max: 100,
          stepSize: 10,
        },
      },
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        borderColor: "rgba(255, 99, 132, 1)",
      },
      point: {
        radius: 5,
        backgroundColor: "rgba(255, 99, 132, 1)",
        borderColor: "#fff",
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="">
      <h1 className="text-3xl font-medium mb-10">Dashboard</h1>

      <div className="grid grid-cols-2 gap-10 ml-6">
        <div className="light-settings flex flex-col max-w-max p-6 bg-[hsl(221.25deg_25.81%_12.16%)] rounded-lg border-2 border-[hsl(221.74deg_25.84%_17.45%)] shadow-md">
          <h2 className="text-xl font-normal mb-4">
            Điều chỉnh thời gian bắt đầu và kết thúc cho tất cả các đèn
          </h2>

          <div className="flex space-x-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-lg font-normal mb-2"
              >
                Thời gian bắt đầu:
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
                className="p-4 bg-[hsl(221.74deg_25.84%_17.45%)] rounded-lg text-xl font-bold text-white"
              />
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="block text-lg font-normal mb-2"
              >
                Thời gian kết thúc:
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                className="p-4 bg-[hsl(221.74deg_25.84%_17.45%)] rounded-lg text-xl font-bold text-white"
              />
            </div>
          </div>

          <p className="mt-5 text-lg font-normal">
            Thời gian bắt đầu: {startTime} <br />
            Thời gian kết thúc: {endTime}
          </p>
        </div>

        <div className="light-controls flex-1 p-6 bg-[hsl(221.25deg_25.81%_12.16%)] rounded-lg border-2 border-[hsl(221.74deg_25.84%_17.45%)] shadow-md">
          <h2 className="text-xl font-normal mb-4">Điều khiển đèn</h2>
          {lights.map((light, index) => {
            return (
              <div key={index} className="flex flex-col gap-y-4 mb-6">
                <div className="flex flex-row gap-x-4 items-center">
                  <h3 className="text-xl font-normal uppercase text-gray-100">
                    {light.device}
                  </h3>

                  <button
                    className={`relative inline-flex items-center p-2 rounded-full w-16 h-8 transition-all duration-300 ease-in-out ${
                      light.status === "on" ? "bg-green-500" : "bg-gray-300"
                    }`}
                    onClick={() => toggleLight(light.device)}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] transition-transform duration-300 ease-in-out w-7 h-7 rounded-full bg-white transform ${
                        light.status === "on"
                          ? "translate-x-8"
                          : "translate-x-1"
                      }`}
                    />
                  </button>

                  <p className="text-lg text-gray-100">
                    Trạng thái của đèn đang:{" "}
                    <span
                      className={
                        light.status ? "text-green-500" : "text-red-500"
                      }
                    >
                      {light.status === "on" ? "Bật" : "Tắt"}
                    </span>
                  </p>
                </div>

                {/* Display additional light data */}
                <div className="flex flex-col gap-y-2 text-gray-200">
                  <p>
                    <strong>Độ sáng: </strong>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={light.brightness}
                      onChange={handleBrightness}
                    />
                    {light.brightness}
                  </p>

                  <p>
                    <strong>Cường độ ánh sáng: </strong>
                    {light.lightIntensity}
                  </p>

                  {/* Motion Status Circle */}
                  <div className="flex items-center gap-x-2">
                    <strong>Trạng thái chuyển động: </strong>
                    <div
                      className={`w-6 h-6 rounded-full ${
                        light.motionStatus === "Motion detected!"
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <p
                      className={
                        light.motionStatus === "Motion detected!"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {light.motionStatus}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-4 m-5 border-2 border-[hsl(221.74deg_25.84%_17.45%)] rounded-lg shadow-md bg-[hsl(221.74deg_25.84%_12%)] max-w-max">
        <h2 className="text-xl text-white mb-4 text-center">
          Dữ liệu cảm biến ánh sáng
        </h2>
        <Line
          data={chartData}
          options={chartOptions}
          className="max-w-[500px] w-full mx-auto h-[300px]"
        />
      </div>
    </div>
  );
};

export default Dashboard;
