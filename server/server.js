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
const setupWSConnection = require("./utils.js").setupWSConnection;
const host = process.env.HOST || "localhost";
const SYNCPORT = process.env.PORT || 1234;

const rooms = new Array();

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
/* generate Client id */

const generateClientId = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
/* search the room */

const searchrooms = (rooms, docName, clientid) => {
    const room = rooms.filter((room) => (room.roomName === docName && room.clientid === clientid));
    return room;
};
/* delete room */

const deleteroom = (room) => {
    const index = rooms.indexOf(room[0]);
    rooms.splice(index, 1);
    return rooms;
}
/* count room */

const countrooms = (rooms, docName) => {
    const room = rooms.filter((room) => room.roomName === docName);
    return room.length;
};
app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json()); // for parsing application/json
wss.on("connection", setupWSConnection);
wss.on("connection",(socket,req) => {
    const clientId = generateClientId(8);
    socket.clientId = clientId;
    const roomName = req.url.substring(1);
    rooms.push({ clientid: clientId, roomName: roomName });
    console.log(`Client ${socket.clientId} connected to room ${roomName}`);

    socket.on("close", () => {
        const result = searchrooms(rooms, roomName, socket.clientId);
        deleteroom(result);
        if(countrooms(rooms, roomName) === 0){
            console.log("delete all");
            wss.close();
        }
    })
})
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
    const { roomNum } = req.body;
    return res.status(201).json({ wsinfo: roomNum });
});
app.post("/api/generate", generatorHandler);

app.post("/api/sessions", async (req, res) => {
    var session = await openvidu.createSession(req.body);
    res.send(session.sessionId);
    wss.createConnection();
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
