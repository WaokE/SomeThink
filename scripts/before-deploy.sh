#!/bin/bash
REPOSITORY=/home/ubuntu/SomeThink/server
cd $REPOSITORY

rm -rf .env

pm2 delete all