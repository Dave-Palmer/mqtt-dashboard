// src/App.jsx
import { useState, useEffect } from "react";
import mqtt from "mqtt";
import SensorCard from "./components/SensorCard";
import LightSwitch from "./components/LightSwitch";

// --- CONFIGURATION ---
const MQTT_CONFIG = {
  // Replace with your HiveMQ cluster URL (Do NOT include wss:// or ports here)
  host: "4773de1176594343b0558641f811171d.s1.eu.hivemq.cloud",
  port: 8884, // Standard HiveMQ Cloud secure WebSocket port
  username: "iPhone-one",
  password: "iPhone-one1",
};

export default function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Master Object states for infinite expandability
  const [sensors, setSensors] = useState({
    "outdoor/temperature": {
      label: "Outdoor Temperature",
      value: "--",
      unit: "°C",
    },
    "outdoor/humidity": { label: "Outdoor Humidity", value: "--", unit: "%" },
    // 💡 Add future sensors here easily!
  });

  const [lights, setLights] = useState({
    "outdoor/relay/lights/state": {
      name: "Outdoor Lights",
      isOn: false,
      isLoaded: false,
      setTopic: "outdoor/relay/lights/set",
    },
    "outdoor/relay/garage/state": {
      name: "Garage Light",
      isOn: false,
      isLoaded: false,
      setTopic: "outdoor/relay/garage/set",
    },
    // 💡 Add future lights here easily!
  });

  // App states initialized to placeholders
  const [temperature, setTemperature] = useState("--");
  const [isLightOn, setIsLightOn] = useState(false);
  const [isLightStateLoaded, setIsLightStateLoaded] = useState(false);

  useEffect(() => {
    // Construct the secure WebSocket string
    const connectUrl = `wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`;

    console.log("Connecting to HiveMQ Cloud...");

    const mqttClient = mqtt.connect(connectUrl, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      clientId: "iphone_pwa_" + Math.random().toString(16).substring(2, 8),
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    mqttClient.on("connect", () => {
      setIsConnected(true);
      setClient(mqttClient);

      // Programmatically subscribe to all keys defined in our config objects
      const topicsToSubscribe = [
        ...Object.keys(sensors),
        ...Object.keys(lights),
      ];
      mqttClient.subscribe(topicsToSubscribe);
    });

    mqttClient.on("message", (topic, message) => {
      const payload = message.toString();

      // Check if incoming topic belongs to sensors
      if (sensors[topic]) {
        setSensors((prev) => ({
          ...prev,
          [topic]: { ...prev[topic], value: payload },
        }));
      }

      // Check if incoming topic belongs to lights status
      if (lights[topic]) {
        setLights((prev) => ({
          ...prev,
          [topic]: {
            ...prev[topic],
            isOn: payload.toUpperCase() === "ON",
            isLoaded: true,
          },
        }));
      }
    });

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  // Action function to publish the change
  const handleToggle = (statusTopic) => {
    if (!client || !isConnected) return;

    // Determine target payload based on local inverted state
    const targetLight = lights[statusTopic];
    const nextState = targetLight.isOn ? "OFF" : "ON";

    // We send the command out to our smart device topic with the "retain" flag
    // Publish to the specific configuration routing target
    client.publish(targetLight.setTopic, nextState, { qos: 1, retain: true });

    // Optimistic UI state flip
    setLights((prev) => ({
      ...prev,
      [statusTopic]: { ...prev[statusTopic], isOn: !targetLight.isOn },
    }));
  };

  return (
    <div style={{ padding: "24px 16px", maxWidth: "500px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <h1 style={{ fontSize: "28px", margin: 0 }}>Home Hub</h1>
        <span
          style={{
            color: isConnected ? "#34c759" : "#ff3b30",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {isConnected ? "● Connected" : "● Disconnected"}
        </span>
      </header>

      {/* Grid of Modular Sensors */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {Object.entries(sensors).map(([topic, sensor]) => (
          <SensorCard
            key={topic}
            label={sensor.label}
            value={sensor.value}
            unit={sensor.unit}
          />
        ))}
      </div>

      <h2 style={{ fontSize: "20px", color: "#aeaea2", marginBottom: "16px" }}>
        Controls
      </h2>

      {/* List of Modular Switches */}
      {Object.entries(lights).map(([topic, light]) => (
        <LightSwitch
          key={topic}
          name={light.name}
          isOn={light.isOn}
          isLoaded={light.isLoaded}
          isConnected={isConnected}
          onToggle={() => handleToggle(topic)}
        />
      ))}
    </div>
  );
}
