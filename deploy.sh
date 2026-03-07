#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLESK_HOME="$(cd "${REPO_DIR}/.." && pwd)"
RELEASES_DIR="${PLESK_HOME}/releases"
CURRENT_LINK="${PLESK_HOME}/current"
HTTPDOCS_PATH="${PLESK_HOME}/httpdocs"
HTTPDOCS_OLD_PATH="${PLESK_HOME}/httpdocs-old"

cd "${REPO_DIR}"

if [[ -d "${HTTPDOCS_PATH}" && ! -L "${HTTPDOCS_PATH}" ]]; then
  if [[ -e "${HTTPDOCS_OLD_PATH}" ]]; then
    echo "Error: ${HTTPDOCS_OLD_PATH} already exists. Resolve manually before deployment."
    exit 1
  fi
  mv "${HTTPDOCS_PATH}" "${HTTPDOCS_OLD_PATH}"
fi

npm ci
npm run build

RELEASE="${RELEASES_DIR}/$(date +%Y%m%d%H%M%S)"
mkdir -p "${RELEASE}"
cp -r dist/* "${RELEASE}/"

ln -sfn "${RELEASE}" "${CURRENT_LINK}"
ln -sfn "${CURRENT_LINK}" "${HTTPDOCS_PATH}"

ls -dt "${RELEASES_DIR}"/* | tail -n +6 | xargs -r rm -rf
