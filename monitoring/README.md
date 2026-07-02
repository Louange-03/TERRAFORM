# Prometheus, Grafana et AlertManager

## Lancer la stack

```bash
cd monitoring
docker compose up -d
```

## Vérifications

```bash
docker compose ps
docker compose logs -f webhook-mock
```

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- AlertManager: http://localhost:9093
- App: http://localhost:3002

## Requêtes PromQL utiles

```promql
rate(http_requests_total[5m])
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```
