// src/App.jsx
import { useState, useEffect } from "react";
import mqtt from "mqtt";

// --- CONFIGURATION ---
const MQTT_CONFIG = {
  // Replace with your HiveMQ cluster URL (Do NOT include wss:// or ports here)
  host: "4773de1176594343b0558641f811171d.s1.eu.hivemq.cloud",
  port: 8884, // Standard HiveMQ Cloud secure WebSocket port
  username: "iPhone-one",
  password: "iPhone-one1",
};

// Topics to subscribe to
const TOPIC_TEMP = "outdoor/temperature";
// const TOPIC_HUMIDITY = 'home/sensors/humidity';
const TOPIC_LIGHT_STATUS = "outdoor/relay/lights/state";

// Topic to publish commands to
const TOPIC_LIGHT_SET = "outdoor/relay/lights/set";
// ---------------------

export default function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

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
      console.log("Successfully connected to HiveMQ! 🎉");
      setIsConnected(true);
      setClient(mqttClient);

      // Subscribe to all relevant incoming topics
      mqttClient.subscribe([TOPIC_TEMP, TOPIC_LIGHT_STATUS]);
    });

    mqttClient.on("message", (topic, message) => {
      const payload = message.toString();
      console.log(`Received: [${topic}] -> ${payload}`);

      // Route the payloads dynamically to the correct React states
      if (topic === TOPIC_TEMP) {
        setTemperature(payload);
      } else if (topic === TOPIC_LIGHT_STATUS) {
        setIsLightOn(payload.toUpperCase() === "ON");
        setIsLightStateLoaded(true); // 👈 Unlock the button now
      }
    });

    mqttClient.on("error", (err) => {
      console.error("Connection error: ", err);
    });

    mqttClient.on("close", () => {
      setIsConnected(false);
    });

    // Cleanup function when component unmounts or hot-reloads
    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  // Action function to publish the change
  const handleToggleLight = () => {
    if (!client || !isConnected) {
      alert("Not connected to HiveMQ broker yet!");
      return;
    }

    // Determine target payload based on local inverted state
    const nextState = isLightOn ? "OFF" : "ON";

    console.log(`Publishing: ${nextState} to ${TOPIC_LIGHT_SET}`);

    // We send the command out to our smart device topic with the "retain" flag
    client.publish(TOPIC_LIGHT_SET, nextState, { qos: 1, retain: true });

    /* Note: For a bulletproof setup, your hardware light relay should process this, 
      flip the relay, and then publish an acknowledgment back to TOPIC_LIGHT_STATUS.
      For instant UI testing, we will optimistically flip the UI state here too:
    */
    setIsLightOn(!isLightOn);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Home Control Dashboard</h1>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: isConnected
              ? "rgba(52, 199, 89, 0.15)"
              : "rgba(255, 59, 48, 0.15)",
            color: isConnected ? "#34c759" : "#ff3b30",
          }}
        >
          {isConnected ? "HiveMQ Connected" : "Disconnected"}
        </span>
      </header>

      {/* Grid Layout for Sensor Cards */}
      <div style={styles.grid}>
        {/* Temperature Card */}
        <div style={styles.card}>
          <span style={styles.cardLabel}>Outdoor Temperature</span>
          <div style={styles.cardValue}>
            {temperature}
            <span style={styles.unit}>°C</span>
          </div>
        </div>

        {/* Humidity Card */}
        {/* <div style={styles.card}>
          <span style={styles.cardLabel}>Humidity</span>
          <div style={styles.cardValue}>
            {humidity}<span style={styles.unit}>%</span>
          </div>
        </div> */}
      </div>

      {/* Control Actions Section */}
      <h2 style={styles.sectionTitle}>Controls</h2>

      {/* Light Toggle Control Row */}
      <div style={styles.controlRow}>
        <div>
          <div style={styles.controlName}>Lights</div>
          <div style={styles.controlSub}>
            {isLightOn ? "Active" : "Turned off"}
          </div>
        </div>

        <button
          onClick={handleToggleLight}
          // Disable if the light state hasn't loaded OR if the broker disconnects
          disabled={!isLightStateLoaded || !isConnected}
          style={{
            ...styles.toggleButton,
            backgroundColor: !isLightStateLoaded
              ? "#2c2c2e"
              : isLightOn
                ? "#34c759"
                : "#1c1c1e",
            opacity: !isLightStateLoaded ? 0.4 : 1, // Dims the button while loading
            cursor: !isLightStateLoaded ? "not-allowed" : "pointer",
            border: !isLightStateLoaded ? "none" : "1px solid #3a3a3c",
          }}
        >
          {!isLightStateLoaded ? "LOADING..." : isLightOn ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}

// Inline styles (remains identical to step 1)
const styles = {
  container: {
    padding: "24px 16px",
    maxWidth: "500px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  statusBadge: {
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "12px",
    fontWeight: "600",
    transition: "all 0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  cardLabel: { fontSize: "14px", color: "#aeaea2", fontWeight: "500" },
  cardValue: { fontSize: "36px", fontWeight: "700", marginTop: "8px" },
  unit: { fontSize: "20px", color: "#aeaea2", marginLeft: "2px" },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#aeaea2",
  },
  controlRow: {
    display: "flex",
    justifyContext: "space-between",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  controlName: { fontSize: "17px", fontWeight: "600" },
  controlSub: { fontSize: "13px", color: "#aeaea2", marginTop: "2px" },
  toggleButton: {
    border: "none",
    color: "#ffffff",
    padding: "10px 24px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};
