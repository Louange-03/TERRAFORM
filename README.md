# Fil rouge - API de tâches

Petite API web en Node.js (Express) qui sert de fil rouge au cours. On part d'une application
volontairement simple, et on lui ajoute, jour après jour, ce qui fait une chaîne DevOps :

- Jour 2 : une chaîne d'intégration continue (lint, tests, build) avec GitHub Actions.
- Jour 3 : une image de conteneur, un fichier Compose, un pipeline de déploiement.
- Jour 4 : un point de santé, des métriques et des journaux structurés.

Ce dépôt de départ ne contient que l'application et ses tests. Tout le reste, c'est vous qui
l'ajoutez pendant les TP.

## Prérequis

- Node.js 24 LTS (ou 22 LTS au minimum)
- npm (fourni avec Node.js)

## Installation

```bash
npm install
```

## Lancer l'application

```bash
npm start
# l'API ecoute sur http://localhost:3000
```

En développement, `npm run dev` redémarre à chaque changement de fichier.

## Lancer les tests

```bash
npm test
```

Les tests utilisent le lanceur de tests intégré à Node (`node --test`), sans dépendance
supplémentaire.

## Vérifier le style du code

```bash
npm run lint
```

## Points d'entrée de l'API

- `GET /` : nom du service
- `GET /tasks` : liste des tâches
- `POST /tasks` : crée une tâche (corps JSON `{ "titre": "..." }`)
- `GET /tasks/:id` : une tâche par son identifiant

Le store est en mémoire : les tâches disparaissent au redémarrage. C'est voulu, on en reparle au
jour 3 (processus sans état et parité des environnements).
