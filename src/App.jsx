// src/App.jsx
import { useState, useEffect } from "react";
import mqtt from "mqtt";
import SensorCard from "./components/SensorCard";
import LightSwitch from "./components/LightSwitch";
import MomentarySwitch from "./components/MomentarySwitch";
import PowerPointRelay from "./components/PowerPointRelay";
import HistoryTemperatureModal, {
  dummyTempHistory,
} from "./components/HistoryTemperatureModal";

export default function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [housePicoStatus, setHousePicoStatus] = useState(false);
  const [garagePicoStatus, setGaragePicoStatus] = useState(false);

  // Track which sensor modal is actively open
  const [selectedHistorySensor, setSelectedHistorySensor] = useState(null);

  const [sensors, setSensors] = useState({
    "house/temperature/outdoor": {
      label: "Ouside Temp",
      value: "--",
      unit: "°C",
      hasHistory: true,
      historyData: dummyTempHistory,
    },
    "house/temperature/indoor": {
      label: "Living Room Temp",
      value: "--",
      unit: "°C",
      hasHistory: true,
      historyData: dummyTempHistory,
    },
    "garage/temperature": {
      label: "Garage Temp",
      value: "--",
      unit: "°C",
      hasHistory: false,
    },
  });

  const [switches, setSwitches] = useState({
    "house/relay/entrylight/state": {
      name: "Entry Light",
      isOn: false,
      isLoaded: false, // Only loaded if the outdoor Pico is online
      setTopic: "house/relay/entrylight/set",
    },
    "powerpoint/relay/state": {
      name: "Power Point Relay",
      isOn: false,
      isLoaded: false, // Only loaded if the garage Pico is online
      setTopic: "powerpoint/relay/set",
    },
  });

  const [momentarySwitches, setMomentarySwitches] = useState({
    "garage/relay/garagedoor/state": {
      name: "Garage Door",
      setTopic: "garage/relay/garagedoor/trigger",
      payload: "PULSE",
    },
    // 💡 You can add an automatic gate or deadbolt trigger here later!
  });

  useEffect(() => {
    // MQTT Engine connection configs — prefer Vite env vars (VITE_MQTT_*),
    const envHost = import.meta.env.VITE_MQTT_HOST;
    const envPort = import.meta.env.VITE_MQTT_PORT;
    const envUser = import.meta.env.VITE_MQTT_USERNAME;
    const envPass = import.meta.env.VITE_MQTT_PASSWORD;

    const mqttConf = {
      // Inline safe defaults when no env vars are provided. For production (Vercel),
      host: envHost || "localhost",
      port: envPort ? Number(envPort) : 8884,
      username: envUser || "",
      password: envPass || "",
    };

    const connectUrl = `wss://${mqttConf.host}:${mqttConf.port}/mqtt`;
    const mqttClient = mqtt.connect(connectUrl, {
      username: mqttConf.username,
      password: mqttConf.password,
      clientId: "iphone_pwa_" + Math.random().toString(16).substring(2, 8),
    });

    mqttClient.on("connect", () => {
      setIsConnected(true);
      setClient(mqttClient);
      mqttClient.subscribe([...Object.keys(sensors), ...Object.keys(switches)]);
      mqttClient.subscribe("house/pico/status"); // Subscribe to house Pico status
      mqttClient.subscribe("garage/pico/status"); // Subscribe to garage Pico status
    });

    mqttClient.on("message", (topic, message) => {
      const payload = message.toString();
      if (topic === "house/pico/status") {
        setHousePicoStatus(payload === "online");
      }
      if (topic === "garage/pico/status") {
        setGaragePicoStatus(payload === "online");
      }
      if (sensors[topic]) {
        setSensors((prev) => ({
          ...prev,
          [topic]: { ...prev[topic], value: payload },
        }));
      }
      if (switches[topic]) {
        setSwitches((prev) => ({
          ...prev,
          [topic]: {
            ...prev[topic],
            isOn: payload.toUpperCase() === "ON",
          },
        }));
      }
    });

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const handleToggle = (statusTopic) => {
    if (!client || !isConnected) return;
    const targetSwitch = switches[statusTopic];
    const nextState = targetSwitch.isOn ? "OFF" : "ON";
    client.publish(targetSwitch.setTopic, nextState, { qos: 1, retain: true });
    setSwitches((prev) => ({
      ...prev,
      [statusTopic]: { ...prev[statusTopic], isOn: !targetSwitch.isOn },
    }));
  };

  const handleRelayOn = (statusTopic) => {
    if (!client || !isConnected) return;
    const targetSwitch = switches[statusTopic];
    client.publish(targetSwitch.setTopic, "ON", { qos: 1, retain: true });
    setSwitches((prev) => ({
      ...prev,
      [statusTopic]: { ...prev[statusTopic], isOn: true },
    }));
  };

  const handleRelayOff = (statusTopic) => {
    if (!client || !isConnected) return;
    const targetSwitch = switches[statusTopic];
    client.publish(targetSwitch.setTopic, "OFF", { qos: 1, retain: true });
    setSwitches((prev) => ({
      ...prev,
      [statusTopic]: { ...prev[statusTopic], isOn: false },
    }));
  };

  const handleMomentaryTrigger = (configKey) => {
    if (!client || !isConnected) return;

    const targetSwitch = momentarySwitches[configKey];

    console.log(
      `Firing pulse: ${targetSwitch.payload} to ${targetSwitch.setTopic}`,
    );

    // Fire the trigger payload. We don't retain momentary pulses.
    client.publish(targetSwitch.setTopic, targetSwitch.payload, {
      qos: 1,
      retain: false,
    });
  };

  // SVG Chart Calculation Math
  // (SVG graph rendering moved to HistoryTemperatureModal component)

  return (
    <div
      style={{
        padding: "24px 16px",
        maxWidth: "500px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", margin: 0, textAlign: "center" }}>
            Home Hub
          </h1>
          <span
            style={{
              color: isConnected ? "#34c759" : "#ff3b30",
              fontSize: "12px",
              fontWeight: "600",
              marginLeft: "12px",
              marginRight: "12px",
            }}
          >
            {isConnected ? "● MQTTConnected" : "● MQTT Disconnected"}
          </span>
          <span
            style={{
              color: housePicoStatus ? "#34c759" : "#ff3b30",
              fontSize: "12px",
              fontWeight: "600",
              marginLeft: "12px",
              marginRight: "12px",
            }}
          >
            {housePicoStatus ? "● House Pico Online" : "● House Pico Offline"}
          </span>
          <span
            style={{
              color: garagePicoStatus ? "#34c759" : "#ff3b30",
              fontSize: "12px",
              fontWeight: "600",
              marginLeft: "12px",
              marginRight: "12px",
            }}
          >
            {garagePicoStatus
              ? "● Garage Pico Online"
              : "● Garage Pico Offline"}
          </span>
        </div>
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
            hasHistory={sensor.hasHistory}
            onClick={() => setSelectedHistorySensor(sensor)}
          />
        ))}
      </div>

      <h2 style={{ fontSize: "20px", color: "#aeaea2", marginBottom: "16px" }}>
        Controls
      </h2>
      {Object.entries(switches).map(([topic, switchItem]) => {
        if (switchItem.name === "Power Point Relay") {
          return (
            <PowerPointRelay
              key={topic}
              name={switchItem.name}
              isOn={switchItem.isOn}
              isLoaded={garagePicoStatus} // Only loaded if the garage Pico is online
              isConnected={isConnected}
              onTurnOn={() => handleRelayOn(topic)}
              onTurnOff={() => handleRelayOff(topic)}
            />
          );
        }

        return (
          <LightSwitch
            key={topic}
            name={switchItem.name}
            isOn={switchItem.isOn}
            isLoaded={housePicoStatus} // Only loaded if the house Pico is online
            isConnected={isConnected}
            onToggle={() => handleToggle(topic)}
          />
        );
      })}
      <h2
        style={{ fontSize: "20px", color: "#aeaea2", margin: "24px 0 16px 0" }}
      >
        Access
      </h2>

      {Object.entries(momentarySwitches).map(([key, item]) => (
        <MomentarySwitch
          key={key}
          name={item.name}
          isConnected={isConnected}
          onTrigger={() => handleMomentaryTrigger(key)}
        />
      ))}

      {/* --- NATIVE-STYLE MODAL DRAWER OVERLAY (moved) --- */}
      {selectedHistorySensor && (
        <HistoryTemperatureModal
          sensor={selectedHistorySensor}
          onClose={() => setSelectedHistorySensor(null)}
        />
      )}
    </div>
  );
}

// modal styles and graph rendering live in the component file
