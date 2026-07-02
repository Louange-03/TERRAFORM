import express from "express";
import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
});

register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);

export function createApp() {
  const app = express();
  app.use(express.json());

  const taches = new Map();
  let prochainId = 1;

  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
      const routePath = req.route?.path ?? req.path;
      const labels = {
        method: req.method,
        path: routePath,
        status: String(res.statusCode),
      };
      httpRequestsTotal.inc(labels);
      httpRequestDurationSeconds.observe(labels, durationSeconds);
    });
    next();
  });

  app.get("/", (req, res) => {
    res.json({ service: "fil-rouge-devops", message: "API de taches" });
  });

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.send(await register.metrics());
  });

  app.get("/tasks", (req, res) => {
    res.json([...taches.values()]);
  });

  app.post("/tasks", (req, res) => {
    const titre = req.body?.titre;
    if (typeof titre !== "string" || titre.trim() === "") {
      res.status(400).json({ erreur: "titre requis" });
      return;
    }
    const tache = { id: prochainId++, titre: titre.trim(), faite: false };
    taches.set(tache.id, tache);
    res.status(201).json(tache);
  });

  app.get("/tasks/:id", (req, res) => {
    const tache = taches.get(Number(req.params.id));
    if (!tache) {
      res.status(404).json({ erreur: "tache introuvable" });
      return;
    }
    res.json(tache);
  });

  return app;
}
