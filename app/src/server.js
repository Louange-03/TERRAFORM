import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`API de taches a l'ecoute sur le port ${port}`);
});
