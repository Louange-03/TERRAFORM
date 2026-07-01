import { createApp } from "./app.js";

// Le port vient de l'environnement (twelve-factor), avec une valeur par defaut
// pour le confort en local. On verra pourquoi au jour 3.
const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`API de taches a l'ecoute sur le port ${port}`);
});
