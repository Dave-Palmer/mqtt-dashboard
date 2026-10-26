import process from "node:process";

const allowedSensors = new Set(["outside", "inside", "garage"]);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sensor = req.query.sensor;
  if (typeof sensor !== "string" || !allowedSensors.has(sensor)) {
    return res.status(404).json({ error: "Unknown temperature sensor" });
  }

  const apiKey = process.env.TEMPERATURE_API_KEY;
  if (!apiKey) {
    console.error("TEMPERATURE_API_KEY is not configured");
    return res.status(500).json({ error: "Temperature history is not configured" });
  }

  const apiBaseUrl =
    process.env.TEMPERATURE_API_URL || "https://pico-temp-api.vercel.app";

  try {
    const url = new URL(`/api/temp/${sensor}`, apiBaseUrl);
    const upstream = await fetch(url, {
      headers: { "x-api-key": apiKey },
    });
    const body = await upstream.json();

    res.setHeader("Cache-Control", "no-store");
    return res.status(upstream.status).json(body);
  } catch (error) {
    console.error("Failed to fetch temperature history:", error);
    return res.status(502).json({ error: "Failed to fetch temperature history" });
  }
}
