#!/bin/bash

export NODE_ENV=production
export PORT=6000
mkdir -p logs
sudo -E forever start app.js -l logs/forever.log -o logs/stdout.log -e logs/error.log
