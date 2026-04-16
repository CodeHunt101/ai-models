#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/../docker-compose.prod.yml" ]]; then
  ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
else
  ROOT_DIR="$SCRIPT_DIR"
fi
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.openai-models}"
SERVICE_NAME="${SERVICE_NAME:-openai-models}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed" >&2
  exit 1
fi

DOCKER_CMD=(docker)
if ! docker ps >/dev/null 2>&1; then
  if sudo -n docker ps >/dev/null 2>&1; then
    DOCKER_CMD=(sudo docker)
  else
    echo "docker requires sudo access; run with a user in docker group or passwordless sudo" >&2
    exit 1
  fi
fi

if ! "${DOCKER_CMD[@]}" compose version >/dev/null 2>&1; then
  echo "docker compose plugin is required" >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "missing compose file: $COMPOSE_FILE" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "missing env file: $ENV_FILE" >&2
  exit 1
fi

cd "$ROOT_DIR"
chmod 600 "$ENV_FILE"

# If old non-compose container exists with same name, replace it.
EXISTING_ID="$("${DOCKER_CMD[@]}" ps -aq --filter "name=^/${SERVICE_NAME}$" | head -n 1)"
if [[ -n "$EXISTING_ID" ]]; then
  COMPOSE_PROJECT_LABEL="$("${DOCKER_CMD[@]}" inspect -f '{{ index .Config.Labels "com.docker.compose.project" }}' "$EXISTING_ID" 2>/dev/null || true)"
  if [[ -z "$COMPOSE_PROJECT_LABEL" ]]; then
    "${DOCKER_CMD[@]}" rm -f "$SERVICE_NAME" >/dev/null 2>&1 || true
  fi
fi

"${DOCKER_CMD[@]}" compose -f "$COMPOSE_FILE" pull "$SERVICE_NAME"
"${DOCKER_CMD[@]}" compose -f "$COMPOSE_FILE" up -d --remove-orphans "$SERVICE_NAME"
"${DOCKER_CMD[@]}" compose -f "$COMPOSE_FILE" ps
"${DOCKER_CMD[@]}" compose -f "$COMPOSE_FILE" logs --tail 30 "$SERVICE_NAME"
