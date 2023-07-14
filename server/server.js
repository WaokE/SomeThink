const express = require("express");
const app = express();
const port = 5050;

app.get("/api", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree", "userFour"] });
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
