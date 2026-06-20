// src/components/SensorCard.jsx
export default function SensorCard({ label, value, unit }) {
  return (
    <div style={styles.card}>
      <span style={styles.cardLabel}>{label}</span>
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
  },
  cardLabel: { fontSize: "14px", color: "#aeaea2", fontWeight: "500" },
  cardValue: { fontSize: "36px", fontWeight: "700", marginTop: "8px" },
  unit: { fontSize: "20px", color: "#aeaea2", marginLeft: "2px" },
};
