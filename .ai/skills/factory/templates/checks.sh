#!/usr/bin/env bash
# The project's checks. Exit 0 only when the branch is fit to review.
#
# The gate runs this script from the main checkout with the job's worktree as
# the working directory, and sets FACTORY_BASE to the base ref (origin/main).
# Keep it fast, deterministic and non-interactive: no watch modes, no prompts,
# nothing that rewrites files (no --fix, no snapshot updates).
#
# `/factory setup` replaces the lines below with this project's real commands.
# Run lint, typecheck and build in full. When the whole test suite is slow, run
# the tests related to what the branch changed; CI still runs everything:
#
#   npm ci --prefer-offline
#   npm run lint
#   npm run typecheck
#   npx vitest related --run $(git diff --name-only "$FACTORY_BASE"...HEAD)
#   npm run build
#
#   composer install --no-interaction
#   vendor/bin/phpstan analyse --no-progress
#   php artisan test --parallel
set -euo pipefail

echo "factory/checks.sh has no checks yet. Run /factory setup to fill in this project's checks." >&2
exit 1
