import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState({
    longitude: 105.787498,
    latitude: 20.981335,
  });
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [lights, setLights] = useState([]);

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

    // Handle light data updates
    socket.on("IOT_LED_1", (data) => {
      console.log("Light data received:", data);

      // Update the devices state with the new GPS location data for each device
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

      // Update the device location
      setDevices((prevDevices) => {
        const updatedDevices = prevDevices.map((device) => {
          if (device.device === data.device) {
            return {
              ...device,
              latitude: data.Latitude,
              longitude: data.Longitude,
            };
          }
          return device;
        });
        if (!updatedDevices.some((device) => device.device === data.device)) {
          updatedDevices.push({
            device: data.device,
            latitude: data.Latitude,
            longitude: data.Longitude,
          });
        }
        return updatedDevices;
      });

      // Update current position to the latest device
      setCurrentPosition({
        longitude: data.Longitude,
        latitude: data.Latitude,
      });

      setLoading(false);
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection on component unmount
    };
  }, []); // Empty array means this effect runs only once when the component mounts

  const mapCenter = currentPosition
    ? [currentPosition.latitude, currentPosition.longitude]
    : [20.981335, 105.787498]; // Default fallback location

  return (
    <div className="w-full flex flex-col items-center p-4">
      <h1 className="text-3xl font-semibold text-gray-100 mb-6">
        GPS Device Tracker
      </h1>

      {loading && <p className="text-blue-500 mb-5">Loading GPS data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-h-max space-y-4 flex-1">
        <MapContainer
          center={mapCenter} // Use the GPS location if available
          zoom={13}
          style={{ height: "500px", width: "100%" }}
          className="rounded-lg shadow-md"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OpenStreetMap tile URL
          />

          {/* Render markers for each device */}
          {devices.map((device) => (
            <Marker
              key={device.device}
              position={[device.latitude, device.longitude]} // Use device's dynamic coordinates
              icon={new L.Icon.Default()} // Default Leaflet marker
            >
              <Popup>
                <strong>Device {device.device}</strong>
                <br />
                Latitude: {device.latitude}
                <br />
                Longitude: {device.longitude}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Devices;
