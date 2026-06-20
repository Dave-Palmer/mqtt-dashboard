// src/components/LightSwitch.jsx
export default function LightSwitch({
  name,
  isOn,
  isLoaded,
  isConnected,
  onToggle,
}) {
  return (
    <div style={styles.controlRow}>
      <div>
        <div style={styles.controlName}>{name}</div>
        <div style={styles.controlSub}>
          {!isLoaded ? "Syncing..." : isOn ? "Active" : "Turned off"}
        </div>
      </div>

      <button
        onClick={onToggle}
        disabled={!isLoaded || !isConnected}
        style={{
          ...styles.toggleButton,
          backgroundColor: !isLoaded ? "#2c2c2e" : isOn ? "#34c759" : "#1c1c1e",
          opacity: !isLoaded ? 0.4 : 1,
          cursor: !isLoaded ? "not-allowed" : "pointer",
          border: !isLoaded ? "none" : "1px solid #3a3a3c",
        }}
      >
        {!isLoaded ? "..." : isOn ? "ON" : "OFF"}
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
  controlSub: { fontSize: "13px", color: "#aeaea2", marginTop: "2px" },
  toggleButton: {
    border: "none",
    color: "#ffffff",
    padding: "10px 24px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "15px",
    transition: "background-color 0.2s ease",
  },
};
