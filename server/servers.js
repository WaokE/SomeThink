require("dotenv").config(!!process.env.CONFIG ? { path: process.env.CONFIG } : {});
const WebSocket = require("ws");
const http = require("http");
const Y = require("yjs");
const server_mindmap = http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("okay");
});
const wss_mindmap = new WebSocket.Server({ port: 1234 });
const wss_timer = new WebSocket.Server({ port: 2345 });

const WSC = require("./utils.js").setupWSConnection;
const host_mindmap = process.env.HOST_MINDMAP || "localhost";
const port_mindmap = process.env.PORT_MINDMAP || 1234;
const host_timer = process.env.HOST_TIMER || "localhost";
const port_timer = process.env.PORT_TIMER || 2345;

const express = require("express");
const cors = require("cors");

const generatorHandler = require("./generator");
const app = express();
const OpenVidu = require("openvidu-node-client").OpenVidu;
const server_audio = http.createServer(app);
const server_timer = http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("okay");
});

const SERVER_PORT = process.env.SERVER_PORT || 5050;
const OPENVIDU_URL = process.env.OPENVIDU_URL || "http://localhost:4443";
const OPENVIDU_SECRET = process.env.OPENVIDU_SECRET;

const openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
const bodyParser = require("body-parser");

app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

wss_mindmap.on("connection", WSC);
wss_timer.on("connection", WSC);

server_mindmap.listen(port_mindmap, host_mindmap, () => {
    console.log(`server_mindmap running at '${host_mindmap}' on port ${port_mindmap}`);
});

server_timer.listen(port_timer, host_timer, () => {
    console.log(`server_timer running at '${host_timer}' on port ${port_timer}`);
});

server_audio.listen(SERVER_PORT, () => {
    console.log("Application started on port: ", SERVER_PORT);
    console.warn("Application server connecting to OpenVidu at " + OPENVIDU_URL);
});

app.post("/api/leavesession", (req, res) => {
    const { roomNum } = req.body;
    return res.status(201).json({ wsinfo: roomNum });
});

app.post("/api/generate", generatorHandler);

app.post("api/sessions", async (req, res) => {
    const session = await openvidu.createSession(req.body);
    res.send(session.sessionId);
    wss_mindmap.createConnection();
});

app.post("/api/sessions/:sessionId/connections", async (req, res) => {
    const session = openvidu.activeSessions.find((s) => s.sessionId === req.params.sessionId);
    if (!session) {
        res.status(404).send();
    } else {
        const connection = await session.createConnection(req.body);
        console.log("connection", connection);
        res.send(connection.token);
    }
});

server_mindmap.on("upgrade", (request, socket, head) => {
    const handleAuth = (ws) => {
        wss_mindmap.emit("connection", ws, request);
    };
    wss_mindmap.handleUpgrade(request, socket, head, handleAuth);
});

server_timer.on("upgrade", (request, socket, head) => {
    const handleAuth = (ws) => {
        wss_timer.emit("connection", ws, request);
    };
    wss_timer.handleUpgrade(request, socket, head, handleAuth);
});

process.on("uncaughtException", (err) => console.error(err));
