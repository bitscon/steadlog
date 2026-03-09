#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

PLESK_ROOT="${PLESK_ROOT:-/var/www/vhosts/steadlog.com}"
REPO_DIR="${REPO_DIR:-${PLESK_ROOT}/repo}"
RELEASES_DIR="${PLESK_ROOT}/releases"
CURRENT_LINK="${PLESK_ROOT}/current"
HTTPDOCS_LINK="${PLESK_ROOT}/httpdocs"
CURRENT_TMP="${PLESK_ROOT}/.current.tmp"
HTTPDOCS_TMP="${PLESK_ROOT}/.httpdocs.tmp"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
NEW_RELEASE="${RELEASES_DIR}/${TIMESTAMP}"

NPM_BIN="$(command -v npm || true)"
RSYNC_BIN="$(command -v rsync || true)"

[[ -n "${NPM_BIN}" ]] || die "npm not found in PATH."
[[ -n "${RSYNC_BIN}" ]] || die "rsync not found in PATH."
[[ -d "${REPO_DIR}" ]] || die "Repository directory does not exist: ${REPO_DIR}"

cleanup() {
  rm -f "${CURRENT_TMP}" "${HTTPDOCS_TMP}"
}
trap cleanup EXIT

log "Starting deployment"
log "Plesk root: ${PLESK_ROOT}"
log "Repo: ${REPO_DIR}"
log "Release: ${NEW_RELEASE}"

mkdir -p "${RELEASES_DIR}"
cd "${REPO_DIR}"

log "Installing dependencies (npm ci)"
"${NPM_BIN}" ci

log "Building app (npm run build)"
"${NPM_BIN}" run build

[[ -d "${REPO_DIR}/dist" ]] || die "Build failed: ${REPO_DIR}/dist was not created."

log "Creating release directory"
mkdir -p "${NEW_RELEASE}"

log "Syncing dist/ into ${NEW_RELEASE}"
"${RSYNC_BIN}" -a --delete "${REPO_DIR}/dist/" "${NEW_RELEASE}/"

log "Switching current symlink atomically"
ln -sfn "${NEW_RELEASE}" "${CURRENT_TMP}"
mv -Tf "${CURRENT_TMP}" "${CURRENT_LINK}"

if [[ -e "${HTTPDOCS_LINK}" && ! -L "${HTTPDOCS_LINK}" ]]; then
  HTTPDOCS_BACKUP="${PLESK_ROOT}/httpdocs.backup.${TIMESTAMP}"
  log "Existing httpdocs directory detected; moving to ${HTTPDOCS_BACKUP}"
  mv "${HTTPDOCS_LINK}" "${HTTPDOCS_BACKUP}"
fi

log "Ensuring httpdocs points to current"
ln -sfn "${CURRENT_LINK}" "${HTTPDOCS_TMP}"
mv -Tf "${HTTPDOCS_TMP}" "${HTTPDOCS_LINK}"

log "Pruning old releases (keeping newest 5)"
mapfile -t RELEASE_NAMES < <(find "${RELEASES_DIR}" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r)
if (( ${#RELEASE_NAMES[@]} > 5 )); then
  for OLD_RELEASE in "${RELEASE_NAMES[@]:5}"; do
    log "Removing old release: ${RELEASES_DIR}/${OLD_RELEASE}"
    rm -rf "${RELEASES_DIR:?}/${OLD_RELEASE}"
  done
fi

log "Deployment complete"
log "Active release: $(readlink -f "${CURRENT_LINK}")"
