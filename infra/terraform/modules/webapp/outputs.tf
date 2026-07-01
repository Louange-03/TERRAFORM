output "container_ids" {
  value = docker_container.app[*].id
}

output "urls" {
  value = [
    for container in docker_container.app :
    "http://localhost:${container.ports[0].external}"
  ]
}