import React from "react";

// --- GENERATE 24HR DUMMY DATA FOR TEMPERATURE ---
export const dummyTempHistory = Array.from({ length: 24 }, (_, i) => {
  const hour = (new Date().getHours() - (23 - i) + 24) % 24;
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const baseTemp = 20 + Math.sin((i - 6) / 3) * 2.5 + Math.random() * 0.4;
  return {
    time: `${displayHour}:00 ${ampm}`,
    val: parseFloat(baseTemp.toFixed(1)),
  };
});

function renderSvgGraph(history) {
  const minVal = Math.min(...history.map((d) => d.val)) - 1;
  const maxVal = Math.max(...history.map((d) => d.val)) + 1;
  const range = maxVal - minVal;

  const points = history
    .map((d, i) => {
      const x = (i / (history.length - 1)) * 320;
      const y = 100 - ((d.val - minVal) / range) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 320 100"
      style={{ width: "100%", height: "140px", marginTop: "16px" }}
    >
      <polyline
        fill="none"
        stroke="#34c759"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function HistoryTemperatureModal({ sensor, onClose }) {
  if (!sensor) return null;

  return (
    <div style={modalStyles.backdrop}>
      <div style={modalStyles.sheet}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{sensor.label} History (24h)</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>
            Close
          </button>
        </div>

        {renderSvgGraph(sensor.historyData)}

        <div style={modalStyles.listContainer}>
          {sensor.historyData
            .slice()
            .reverse()
            .map((item, idx) => (
              <div key={idx} style={modalStyles.listItem}>
                <span style={{ color: "#aeaea2" }}>{item.time}</span>
                <span style={{ fontWeight: "600" }}>
                  {item.val}
                  {sensor.unit}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "flex-end",
    zIndex: 1000,
  },
  sheet: {
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    padding: "24px 20px",
    boxSizing: "border-box",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  title: { fontSize: "18px", margin: 0, fontWeight: "600" },
  closeBtn: {
    border: "none",
    backgroundColor: "#2c2c2e",
    color: "#0a84ff",
    padding: "6px 14px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  listContainer: {
    overflowY: "auto",
    marginTop: "16px",
    flex: 1,
    WebkitOverflowScrolling: "touch",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #2c2c2e",
    fontSize: "15px",
  },
};
