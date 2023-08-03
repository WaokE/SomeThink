#!/bin/bash
REPOSITORY=/home/ubuntu/SomeThink/server
cd $REPOSITORY

npm install

rm -rf .env

pm2 delete all