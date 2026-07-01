# Terraform Kubernetes

This directory contains the Kubernetes runtime for the fil rouge application.

## Variables

- `kubeconfig_path`: path to the kubeconfig file
- `kube_context`: kubectl context to use
- `namespace`: target namespace
- `image_repository` and `image_tag`: Docker image contract from exercise 06b
- `app_replicas`: declarative scaling value
- `app_log_level`: application log level propagated through the ConfigMap
- `db_password`: PostgreSQL password stored in a Terraform-managed Secret

## Usage

```bash
terraform init
terraform fmt
terraform plan
terraform apply
```

Then verify:

```bash
terraform output
kubectl get all -n devops-training
kubectl wait --for=condition=available deployment/devops-app -n devops-training --timeout=120s
kubectl exec -n devops-training deploy/devops-app -- printenv | grep -E 'APP_LOG_LEVEL|LOG_LEVEL|DB_HOST'
kubectl port-forward -n devops-training svc/devops-app-svc 18080:80
curl http://localhost:18080/
curl http://localhost:18080/health
```