const express = require("express");
const request = require("request");
const cors = require("cors");
const shortid = require("shortid"); // shortid 라이브러리 추가
const app = express();
const PORT = 3030;

app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
);

// URL 매핑을 위한 객체 생성
const urlMap = {};

app.get("/api/proxyImage", (req, res) => {
    const imageUrl = req.query.url;

    // 이미지 URL을 그대로 클라이언트에게 전달
    const shortImageUrl = generateShortUrl(imageUrl);
    res.json({ imageUrl: shortImageUrl });
});

app.get("/:shortId", (req, res) => {
    const shortId = req.params.shortId;
    const imageUrl = urlMap[shortId];

    if (!imageUrl) {
        res.status(404).send("Not Found");
        return;
    }

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

function generateShortUrl(imageUrl) {
    const shortId = shortid.generate();
    urlMap[shortId] = imageUrl;
    return `http://localhost:${PORT}/${shortId}`;
}

app.listen(PORT, () => {
    console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
