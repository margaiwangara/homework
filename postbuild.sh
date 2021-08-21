#! /bin/bash

BUILD_DIR="./dist"
SRC_DIR="src"

# copy views and public dirs
cp -R "$SRC_DIR/public" "$BUILD_DIR/public"
cp -R "$SRC_DIR/views" "$BUILD_DIR/views"

# create a .env file and add node env
touch "$BUILD_DIR/.env"
echo "NODE_ENV=production" >> "$BUILD_DIR/.env"
