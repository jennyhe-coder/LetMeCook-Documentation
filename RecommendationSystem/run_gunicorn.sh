#!/bin/bash

# Get logical CPU count (88)
CPU_COUNT=$(nproc)

WORKERS=$(( CPU_COUNT * 2 + 1 ))
MAX_WORKERS=24
if [ $WORKERS -gt $MAX_WORKERS ]; then
  WORKERS=$MAX_WORKERS
fi

BIND="0.0.0.0:5001"
APP_MODULE="app:app"

echo "🚀 Starting Gunicorn with $WORKERS workers on $BIND ..."
gunicorn -w $WORKERS -b $BIND $APP_MODULE
