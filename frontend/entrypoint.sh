#!/bin/sh
set -e

# Replace the build-time placeholder with the actual runtime environment variable
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "Injecting runtime API URL: $NEXT_PUBLIC_API_URL"
  find /app/.next -type f -name "*.js" -exec sed -i "s|__RUNTIME_API_URL__|${NEXT_PUBLIC_API_URL}|g" {} +
fi

exec "$@"
