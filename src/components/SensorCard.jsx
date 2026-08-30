// src/components/SensorCard.jsx
export default function SensorCard({
  label,
  value,
  unit,
  hasHistory,
  onClick,
}) {
  return (
    <div
      onClick={hasHistory ? onClick : undefined}
      style={{
        ...styles.card,
        cursor: hasHistory ? "pointer" : "default",
        transform: "scale(1)", // Fixes active scale context on mobile
      }}
      // Adds a subtle native tap effect on iOS
      onTouchStart={(e) =>
        hasHistory && (e.currentTarget.style.backgroundColor = "#2c2c2e")
      }
      onTouchEnd={(e) =>
        hasHistory && (e.currentTarget.style.backgroundColor = "#1c1c1e")
      }
    >
      <div style={styles.cardHeader}>
        <span style={styles.cardLabel}>{label}</span>
        {hasHistory && <span style={styles.historyIcon}>📊</span>}
      </div>
      <div style={styles.cardValue}>
        {value}
        <span style={styles.unit}>{unit}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    transition: "background-color 0.1s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: { fontSize: "14px", color: "#aeaea2", fontWeight: "500" },
  historyIcon: { fontSize: "12px", opacity: 0.6 },
  cardValue: { fontSize: "36px", fontWeight: "700", marginTop: "8px" },
  unit: { fontSize: "20px", color: "#aeaea2", marginLeft: "2px" },
};
