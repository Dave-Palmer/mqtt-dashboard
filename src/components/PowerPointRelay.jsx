// src/components/PowerPointRelay.jsx
export default function PowerPointRelay({
  name,
  isOn,
  isLoaded = true,
  isConnected,
  isPending = false,
  onTurnOn,
  onTurnOff,
}) {
  const canControl = isLoaded && isConnected && !isPending;

  return (
    <div style={styles.controlRow}>
      <div>
        <div style={styles.controlName}>{name}</div>
        <div style={styles.controlSub}>
          {!isLoaded
            ? "Syncing..."
            : isPending
              ? "Updating..."
              : isOn
                ? "Relay ON"
                : "Relay OFF"}
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button
          type="button"
          onClick={onTurnOff}
          disabled={!canControl || !isOn}
          style={{
            ...styles.actionButton,
            ...styles.offButton,
            opacity: !canControl || !isOn ? 0.45 : 1,
            cursor: !canControl || !isOn ? "not-allowed" : "pointer",
            backgroundColor: isPending ? "#3a3a3c" : "#df250c",
          }}
        >
          {isPending ? "WAIT" : "OFF"}
        </button>

        <button
          type="button"
          onClick={onTurnOn}
          disabled={!canControl || isOn}
          style={{
            ...styles.actionButton,
            ...styles.onButton,
            opacity: !canControl || isOn ? 0.45 : 1,
            cursor: !canControl || isOn ? "not-allowed" : "pointer",
            backgroundColor: isPending ? "#3a3a3c" : "#34c759",
          }}
        >
          {isPending ? "WAIT" : "ON"}
        </button>
      </div>
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
  buttonGroup: {
    display: "flex",
    gap: "8px",
  },
  actionButton: {
    border: "1px solid #3a3a3c",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    transition: "all 0.2s ease",
    minWidth: "72px",
  },
  offButton: {
    backgroundColor: "#df250c",
  },
  onButton: {
    backgroundColor: "#34c759",
    borderColor: "#34c759",
  },
};
