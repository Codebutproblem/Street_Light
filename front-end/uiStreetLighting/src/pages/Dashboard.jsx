import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import axios from "axios";

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
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [statusLight, setStatusLight] = useState("on");
  const [timeRange, setTimeRange] = useState("08:00 - 17:00");
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, []);

  const toggleLight = (device) => {
    setLights((prev) => {
      const updatedLights = prev.map((light) => {
        if (light.device === device) {
          const status = statusLight === "on" ? "off" : "on";
          setStatusLight(status);
          return { ...light, status };
        }
        return light;
      });
      return updatedLights;
    });

    axios
      .post("http://localhost:8087/api/v1/changeLight", {
        status: statusLight,
      })
      .then(() => {
        console.log("SUCCESS");
      })
      .catch((error) => {
        console.error("Error changing light status:", error);
      });
  };

  const handleTimeRangeChange = (event) => {
    const value = event.target.value;
    setTimeRange(value);
  };

  const validateTimeRange = () => {
    const timePattern = /^([0-9]{2}):([0-9]{2})\s*-\s*([0-9]{2}):([0-9]{2})$/;
    const match = timeRange.match(timePattern);

    if (!match) {
      setIsValid(false);
      alert("Please enter a valid time range (e.g., HH:mm - HH:mm).");
      return false;
    }

    const startTime = match[1] + ":" + match[2];
    const endTime = match[3] + ":" + match[4];

    if (startTime >= endTime) {
      setIsValid(false);
      alert("Start time cannot be later than or equal to end time.");
      return false;
    }

    setIsValid(true);
    return { startTime, endTime };
  };

  const handleSubmit = async () => {
    const validTimes = validateTimeRange();
    if (!validTimes) return;

    setIsSubmitting(true);

    setTimeout(() => {
      axios
        .post("http://localhost:8087/api/v1/changeSchedule", {
          start_time: validTimes.startTime,
          end_time: validTimes.endTime,
        })
        .then((response) => {
          console.log("SUCCESS: time range updated for all lights");
        })
        .catch((error) => {
          console.error("Error changing end time:", error);
        });
      setIsSubmitting(false);
      alert("Data submitted successfully!");
    }, 2000);
  };

  const handleBrightness = (e, device) => {
    const newBrightness = e.target.value;

    setLights((prevLights) =>
      prevLights.map((light) =>
        light.device === device
          ? { ...light, brightness: newBrightness }
          : light
      )
    );

    axios
      .post("http://localhost:8087/api/v1/changeBrightness", {
        brightness: newBrightness,
      })
      .then((response) => {
        console.log("SUCCESS: Brightness updated for all lights");
      })
      .catch((error) => {
        console.error("Error changing brightness:", error);
      });
  };

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
    <div className="flex-1">
      <h1 className="text-3xl font-medium mb-10">Dashboard</h1>

      <div className="grid grid-cols-2 gap-10 ml-6">
        <div className="light-settings flex flex-col max-w-max p-6 bg-[hsl(221.25deg_25.81%_12.16%)] rounded-lg border-2 border-[hsl(221.74deg_25.84%_17.45%)] shadow-md">
          <h2 className="text-xl font-normal mb-4">
            Điều chỉnh thời gian bắt đầu và kết thúc cho tất cả các đèn
          </h2>

          <div>
            <label
              htmlFor="time_range"
              className="block text-lg font-normal mb-2"
            >
              Thời gian (Start - End):
            </label>
            <input
              id="time_range"
              type="text"
              value={timeRange}
              onChange={handleTimeRangeChange}
              placeholder="HH:mm - HH:mm"
              className="p-4 bg-[hsl(221.74deg_25.84%_17.45%)] rounded-lg text-xl font-bold text-white"
            />

            <p className="mt-5 text-lg font-normal">
              Thời gian bắt đầu: {timeRange.split(" - ")[0]} <br />
              Thời gian kết thúc: {timeRange.split(" - ")[1]}
            </p>

            {/* Submit Button */}
            <div className="mt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`p-2 text-white bg-blue-500 rounded-lg ${
                  isSubmitting ? "cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>

            {/* Show error message if the input is invalid */}
            {!isValid && (
              <p className="text-red-500 mt-2">
                Please enter a valid time range (Start time must be earlier than
                End time).
              </p>
            )}
          </div>
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
                      onChange={(e) => handleBrightness(e, light.device)}
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

      <div className="ml-6 p-4 mt-10 border-2 border-[hsl(221.74deg_25.84%_17.45%)] rounded-lg shadow-md bg-[hsl(221.74deg_25.84%_12%)]">
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
