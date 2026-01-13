/*
 * @Date: 2026-01-13 14:47:58
 * @LastEditTime: 2026-01-13 15:02:55
 * @Description: file content
 */
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const port = 30900;

app.use(cors()); // 启用CORS，允许跨域请求

app.use("/models", express.static(path.join(__dirname, "models")));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening at http://localhost:${port}`);
});
