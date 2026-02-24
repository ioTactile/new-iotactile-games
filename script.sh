#!/usr/bin/env bash

set -euo pipefail

case "${1:-}" in
  dev)
    pnpm run docker:dev
    cd app
    pnpm run dev
    ;;
  prod)
    pnpm run docker:prod
    ;;
  test)
    cd api
    pnpm run test
    cd ../app
    pnpm run test
    ;;
  *)
    echo "Usage: $0 {dev|prod|test}"
    exit 1
    ;;
esac

