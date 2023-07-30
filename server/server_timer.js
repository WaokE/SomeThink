#!/usr/bin/env node

/**
 * @type {any}
 */

const WebSocket = require("ws");
const http = require("http");
const wss = new WebSocket.Server({ noServer: true });
const setupWSConnection = require("./utils.js").setupWSConnection;
const host = process.env.TIMER_HOST || "localhost";
const SYNCPORT = process.env.TIMER_PORT || 2345;
const server = http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("okay");
});

const express = require("express");
const cors = require("cors"); // Add this line to import CORS

const app = express();

app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json()); // for parsing application/json
wss.on("connection", setupWSConnection);

server.on("upgrade", (request, socket, head) => {
    // You may check auth of request here..
    // See https://github.com/websockets/ws#client-authentication
    /**
     * @param {any} ws
     */
    const handleAuth = (ws) => {
        wss.emit("connection", ws, request);
    };
    wss.handleUpgrade(request, socket, head, handleAuth);
});

server.listen(SYNCPORT, host, () => {
    console.log(`running at '${host}' on port ${SYNCPORT}`);
});
