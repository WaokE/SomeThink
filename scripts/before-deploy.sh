#!/bin/bash
REPOSITORY=/home/ubuntu/SomeThink/server
cd $REPOSITORY

pm2 stop all

pm2 delete all