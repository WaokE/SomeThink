// proxy-server.js

const express = require("express");
const request = require("request");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
);

app.get("/api/proxyImage", (req, res) => {
    const imageUrl = req.query.url;
    console.log("imageUrl", imageUrl);
    request.get({ url: imageUrl, encoding: null }, (err, response, body) => {
        if (err) {
            console.error("이미지 다운로드 에러:", err);
            res.status(500).send("Internal Server Error");
        } else {
            res.set("Content-Type", response.headers["content-type"]);
            res.send(body);
        }
    });
});

app.listen(PORT, () => {
    console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
