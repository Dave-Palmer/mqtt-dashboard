import { useEffect, useState } from "react";

function renderSvgGraph(history) {
  if (history.length === 0) return null;

  const minVal = Math.min(...history.map((d) => d.val)) - 1;
  const maxVal = Math.max(...history.map((d) => d.val)) + 1;
  const range = maxVal - minVal;

  const points = history
    .map((d, i) => {
      const x = history.length === 1 ? 160 : (i / (history.length - 1)) * 320;
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
      {history.length === 1 && (
        <circle
          cx="160"
          cy={100 - ((history[0].val - minVal) / range) * 80}
          r="4"
          fill="#34c759"
        />
      )}
    </svg>
  );
}

export default function HistoryTemperatureModal({ sensor, onClose }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sensor?.historySensor) return undefined;

    const controller = new AbortController();

    async function loadHistory() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/temp/${encodeURIComponent(sensor.historySensor)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`History request failed (${response.status})`);
        }

        const rows = await response.json();
        if (!Array.isArray(rows)) {
          throw new Error("The history API returned an invalid response");
        }

        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const records = rows
          .map((row) => ({
            timestamp: new Date(row.timestamp),
            val: Number(row.temperature),
          }))
          .filter(
            (row) =>
              Number.isFinite(row.val) &&
              !Number.isNaN(row.timestamp.getTime()) &&
              row.timestamp.getTime() >= cutoff,
          )
          .sort((a, b) => a.timestamp - b.timestamp);

        const hourlyReadings = new Map();
        records.forEach(({ timestamp, val }) => {
          const hourKey = [
            timestamp.getFullYear(),
            timestamp.getMonth(),
            timestamp.getDate(),
            timestamp.getHours(),
          ].join("-");
          const reading = hourlyReadings.get(hourKey);

          if (reading) {
            reading.total += val;
            reading.count += 1;
          } else {
            hourlyReadings.set(hourKey, {
              timestamp,
              total: val,
              count: 1,
            });
          }
        });

        const hourlyRecords = [...hourlyReadings.values()].map(
          ({ timestamp, total, count }) => ({
            timestamp,
            val: total / count,
          }),
        );

        const aggregatedRecords = hourlyRecords.map((row) => ({
          time: row.timestamp.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
          val: row.val,
        }));

        setHistory(aggregatedRecords);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(
            requestError.message || "Unable to load temperature history",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();
    return () => controller.abort();
  }, [sensor?.historySensor]);

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

        {isLoading ? (
          <p style={modalStyles.message}>Loading temperature history…</p>
        ) : error ? (
          <p style={modalStyles.error}>{error}</p>
        ) : history.length === 0 ? (
          <p style={modalStyles.message}>
            No temperature readings in the last 24 hours.
          </p>
        ) : (
          renderSvgGraph(history)
        )}

        <div style={modalStyles.listContainer}>
          {history
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
  message: { color: "#aeaea2", textAlign: "center", padding: "24px 0" },
  error: { color: "#ff6b64", textAlign: "center", padding: "24px 0" },
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
