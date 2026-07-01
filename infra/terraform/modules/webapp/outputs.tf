output "container_ids" {
  value = docker_container.app[*].id
}

output "urls" {
  value = [
    for container in docker_container.app :
    "http://localhost:${container.ports[0].external}"
  ]
}

output "ansible_hosts" {
  value = {
    for container in docker_container.app :
    container.name => {
      public_url  = "http://localhost:${container.ports[0].external}"
      public_port = container.ports[0].external
    }
  }
}