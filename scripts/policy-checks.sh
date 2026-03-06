#!/usr/bin/env bash
set -euo pipefail

STACK="${1:-node}"

if [[ "${STACK}" != "node" ]]; then
  echo "Unsupported stack: ${STACK}. This repository uses node." >&2
  exit 1
fi

required_docs=(
  "docs/PROJECT_OVERVIEW.md"
  "docs/PRODUCT_VISION.md"
  "docs/PROBLEM_STATEMENT.md"
  "docs/DOMAIN_MODEL.md"
  "docs/SYSTEM_ARCHITECTURE.md"
  "docs/SECURITY_MODEL.md"
  "docs/TESTING_STRATEGY.md"
  "docs/ROADMAP.md"
)

missing=0
for doc in "${required_docs[@]}"; do
  if [[ ! -f "${doc}" ]]; then
    echo "Missing required document: ${doc}" >&2
    missing=1
  fi
done

if [[ ! -f "config/dependency-policy.yaml" ]]; then
  echo "Missing dependency policy: config/dependency-policy.yaml" >&2
  missing=1
fi

if [[ ! -f "package-lock.json" ]]; then
  echo "Missing lockfile: package-lock.json" >&2
  missing=1
fi

if [[ "${missing}" -ne 0 ]]; then
  exit 1
fi

npm run -s lint
npm run -s type-check

echo "Policy checks passed."
