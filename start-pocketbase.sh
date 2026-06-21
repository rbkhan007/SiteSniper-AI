#!/bin/bash
# PocketBase Startup Script for SiteSniper AI
# Run this before starting the Next.js dev server

echo "Starting PocketBase server..."
echo "Dashboard: http://127.0.0.1:8090/_/"
echo "API: http://127.0.0.1:8090/api/"

./pocketbase/pocketbase serve --http 127.0.0.1:8090
