require("dotenv").config();

const express = require("express");
const cors = require("cors"); // Add this line to import CORS
const generatorHandler = require("./generator"); // assuming generator.js is in the same directory
const app = express();
const port = 5050;

app.use(cors()); // And add this line to use CORS as middleware
app.use(express.json()); // for parsing application/json

app.get("/api", (req, res) => {
    res.json({ users: ["userOne", "userTwo", "userThree", "userFour"] });
});

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});

app.post("/api/generate", generatorHandler);
