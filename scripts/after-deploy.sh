#!/bin/bash
REPOSITORY=/home/ubuntu/SomeThink/server

cd $REPOSITORY

pm2 start ./ecosystem.config.js