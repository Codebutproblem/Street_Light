import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import mqtt from "mqtt";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mqttClient, setMqttClient] = useState(null);

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentPosition({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
          },
          (error) => {
            setError("Unable to retrieve location.");
            setLoading(false);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
        setLoading(false);
      }
    };

    getCurrentLocation();

    // MQTT connection options
    const options = {
      host: "a290b9bc05ee4afdbc18a2fd30f92d28.s1.eu.hivemq.cloud",
      port: 8884,
      protocol: "wss",
      username: "thanh",
      password: "123",
      path: "mqtt", // WebSocket path for HiveMQ
    };

    const client = mqtt.connect(
      `${options.protocol}://${options.host}:${options.port}/${options.path}`,
      {
        username: options.username,
        password: options.password,
      }
    );

    setMqttClient(client);

    client.on("connect", () => {
      client.subscribe("devices/+/location", (err) => {
        if (err) {
          setError("Error subscribing to location topic.");
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const locationData = JSON.parse(message.toString());
        const deviceId = topic.split("/")[1];

        setDevices((prevDevices) => {
          const existingDevice = prevDevices.find(
            (device) => device.id === deviceId
          );
          if (existingDevice) {
            return prevDevices.map((device) =>
              device.id === deviceId ? { ...device, ...locationData } : device
            );
          } else {
            return [...prevDevices, { id: deviceId, ...locationData }];
          }
        });
      } catch (error) {
        setError("Error processing incoming message.");
      }
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);

  const mapCenter = currentPosition
    ? [currentPosition.latitude, currentPosition.longitude]
    : [51.505, -0.09]; // Default fallback location

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
              key={device.id}
              position={[device.latitude, device.longitude]}
              icon={new L.Icon.Default()} // Default Leaflet marker
            >
              <Popup>
                <strong>Device {device.id}</strong>
                <br />
                Latitude: {device.latitude}
                <br />
                Longitude: {device.longitude}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Optional button to refresh location */}
      {mqttClient && (
        <button
          onClick={() => mqttClient.publish("devices/refresh", "get location")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
        >
          Refresh Devices Location
        </button>
      )}
    </div>
  );
};

export default Devices;
