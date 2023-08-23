const express = require("express");
const app = express();
const PORT = 80;

// app.use(express.static(""));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/main.js", function requestHandler(req, res) {
  res.sendFile(__dirname + "/main.js");
});


app.get("/style.css", function requestHandler(req, res) {
  res.sendFile(__dirname + "/style.css");
});

app.get("/donkey.mp3", function requestHandler(req, res) {
  res.sendFile(__dirname + "/donkey.mp3");
});

app.get("/donkey.ogg", function requestHandler(req, res) {
  res.sendFile(__dirname + "/donkey.ogg");
});

app.get("/node_modules/matter-js/build/matter.min.js", function requestHandler(req, res) {
  res.sendFile(__dirname + "/node_modules/matter-js/build/matter.min.js");
});


app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));