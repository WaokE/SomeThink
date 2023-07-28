#!/usr/bin/env node

/**
 * @type {any}
 */

require("dotenv").config(!!process.env.CONFIG ? { path: process.env.CONFIG } : {});
const WebSocket = require("ws");
const http = require("http");
const Y = require("yjs");
const server = http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("okay");
});
const wss = new WebSocket.Server({ noServer: true });
const { WebsocketProvider } = require("y-websocket");
const setupWSConnection = require("./utils.js").setupWSConnection;
const host = process.env.HOST || "localhost";
const SYNCPORT = process.env.PORT || 1234;

const rooms = new Map();

const express = require("express");
const cors = require("cors"); // Add this line to import CORS
const generatorHandler = require("./generator"); // assuming generator.js is in the same directory
const app = express();
const OpenVidu = require("openvidu-node-client").OpenVidu;
const audio_server = http.createServer(app);

// // Environment variable: PORT where the node server is listening
let SERVER_PORT = process.env.SERVER_PORT || 5050;
// // Environment variable: URL where our OpenVidu server is listening
let OPENVIDU_URL = process.env.OPENVIDU_URL || "http://localhost:4443";
// // Environment variable: secret shared with our OpenVidu server
let OPENVIDU_SECRET = process.env.OPENVIDU_SECRET;

const openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
const bodyParser = require("body-parser");
app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json()); // for parsing application/json
wss.on("connection", setupWSConnection);
// Allow application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Allow application/json
app.use(bodyParser.json());
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
app.post("/api/leavesession", (req, res) => {
    wss.close();
    return res.status(201).json("success");
});
app.post("/api/generate", generatorHandler);

app.post("/api/sessions", async (req, res) => {
    var session = await openvidu.createSession(req.body);
    res.send(session.sessionId);
});

app.post("/api/sessions/:sessionId/connections", async (req, res) => {
    var session = openvidu.activeSessions.find((s) => s.sessionId === req.params.sessionId);
    if (!session) {
        res.status(404).send();
    } else {
        var connection = await session.createConnection(req.body);
        console.log("connection", connection);
        res.send(connection.token);
    }
});

// // Serve application
audio_server.listen(SERVER_PORT, () => {
    console.log("Application started on port: ", SERVER_PORT);
    console.warn("Application server connecting to OpenVidu at " + OPENVIDU_URL);
});

process.on("uncaughtException", (err) => console.error(err));
