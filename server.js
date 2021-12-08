const { createServer } = require("http");
// const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const port = 3002;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// const httpsOptions = {
//     key: fs.readFileSync("./https_cert/localhost+3-key.pem"),
//     cert: fs.readFileSync("./https_cert/localhost+3.pem")
// };

// const httpsOptions = {
//     key: fs.readFileSync("./https_cert/localhost+1-key.pem"),
//     cert: fs.readFileSync("./https_cert/localhost+1.pem")
// };

app.prepare().then(() => {
    // createServer(httpsOptions, (req, res) => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        // console.log("ready - started server on url: https://localhost:" + port);
        console.log("ready - started server on url: http://localhost:" + port);
    });
});
