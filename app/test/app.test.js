import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

let server;
let base;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      base = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
});

test("GET / repond avec le nom du service", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.service, "fil-rouge-devops");
});

test("GET /health repond ok", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});

test("GET /metrics expose des metriques Prometheus", async () => {
  const res = await fetch(`${base}/metrics`);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /http_requests_total/);
});

test("GET /tasks renvoie une liste vide au depart", async () => {
  const res = await fetch(`${base}/tasks`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
});

test("POST /tasks cree une tache", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ titre: "ecrire la chaine d'integration" }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.titre, "ecrire la chaine d'integration");
  assert.equal(body.faite, false);
});

test("POST /tasks sans titre renvoie 400", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
});
