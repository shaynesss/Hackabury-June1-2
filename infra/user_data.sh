#!/bin/bash
set -euxo pipefail

# Amazon Linux 2023 ships Docker in the default repos.
yum update -y
yum install -y docker git

systemctl enable --now docker

# Let the default AL2023 user run docker without sudo.
usermod -aG docker ec2-user

# Install the Docker Compose v2 CLI plugin (aliased as docker-compose).
DOCKER_COMPOSE_VERSION="v2.29.2"
case "$(uname -m)" in
  x86_64)  COMPOSE_ARCH="x86_64" ;;
  aarch64) COMPOSE_ARCH="aarch64" ;;
  *)       echo "unsupported arch: $(uname -m)" >&2; exit 1 ;;
esac
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-${COMPOSE_ARCH}" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
ln -sf /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

# Confirm both tools are on the PATH.
docker --version
docker compose version || true
