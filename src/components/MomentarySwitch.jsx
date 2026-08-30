// src/components/MomentarySwitch.jsx
import { useState } from "react";

export default function MomentarySwitch({
  name,
  isConnected,
  isLoaded = true,
  onTrigger,
}) {
  const [isPressing, setIsPressing] = useState(false);

  const handlePress = async () => {
    if (isPressing || !isConnected || !isLoaded) return;

    setIsPressing(true);
    onTrigger(); // Fires the MQTT message immediately

    // Keeps the UI button visually locked/depressed for 1 second
    // so the user knows the action successfully went through
    setTimeout(() => {
      setIsPressing(false);
    }, 1000);
  };

  return (
    <div style={styles.controlRow}>
      <div style={styles.controlName}>{name}</div>

      <button
        onClick={handlePress}
        disabled={isPressing || !isConnected || !isLoaded}
        style={{
          ...styles.pulseButton,
          backgroundColor: isPressing ? "#1c1c1e" : "#0a84ff",
          borderColor: isPressing ? "#3a3a3c" : "transparent",
          transform: isPressing ? "scale(0.96)" : "scale(1)",
          opacity: !isConnected || !isLoaded ? 0.4 : 1,
        }}
      >
        {!isLoaded ? "OFFLINE" : isPressing ? "TRIGGERING..." : "PRESS"}
      </button>
    </div>
  );
}

const styles = {
  controlRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    marginBottom: "12px",
  },
  controlName: { fontSize: "17px", fontWeight: "600" },
  pulseButton: {
    border: "1px solid transparent",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.1s ease",
    minWidth: "120px",
  },
};
