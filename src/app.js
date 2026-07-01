import express from "express";

// Construit l'application Express. On exporte une fabrique (et pas une instance
// deja demarree) pour pouvoir creer une app neuve dans chaque test, sans port fixe.
export function createApp() {
  const app = express();
  app.use(express.json());

  // Store en memoire : volontairement simple pour le fil rouge. Une vraie base
  // arrivera quand on parlera de parite des environnements (jour 3).
  const taches = new Map();
  let prochainId = 1;

  app.get("/", (req, res) => {
    res.json({ service: "fil-rouge-devops", message: "API de taches" });
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
