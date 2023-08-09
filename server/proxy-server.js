const express = require("express");
const request = require("request");
const cors = require("cors");
const sharp = require("sharp");

const app = express();
const PORT = 3030;

app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
);

app.get("/api/proxyImage", async (req, res) => {
    const imageUrl = req.query.url;

    try {
        const imageBuffer = await downloadImage(imageUrl);
        const optimizedBuffer = await optimizeImage(imageBuffer);
        const dataUrl = createShortDataUrl(optimizedBuffer);

        res.json({ dataUrl: dataUrl });
    } catch (error) {
        console.error("이미지 다운로드 및 변환 중 에러:", error);
        res.status(500).send("Internal Server Error");
    }
});

async function downloadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        request.get({ url: imageUrl, encoding: null }, (err, response, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}

async function optimizeImage(imageBuffer) {
    const metadata = await sharp(imageBuffer).metadata();
    let width = metadata.width;
    let height = metadata.height;

    let quality;
    if (width <= 200) {
        quality = 33;
    } else if (width <= 400) {
        quality = 20;
    } else if (width <= 600) {

        quality = 10;
    } 
    else if (width <= 800) {
        quality = 5;
    } else {
        quality = 3;
    }

    return sharp(imageBuffer).webp({ quality: quality }).toBuffer();
}

function createShortDataUrl(imageBuffer) {
    const base64Image = imageBuffer.toString("base64");
    const contentType = "image/jpeg"; // 이미지 타입에 맞게 수정
    return `data:${contentType};base64,${base64Image}`;
}

app.listen(PORT, () => {
    console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
