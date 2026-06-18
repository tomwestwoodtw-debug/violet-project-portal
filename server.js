/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "0.0.0.0";
const dev = process.env.NODE_ENV === "development";

if (Number.isNaN(port)) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const app = next({ dev, hostname: host, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((request, response) => {
    handle(request, response);
  }).listen(port, host, () => {
    console.log(`Violet Project Portal listening on http://${host}:${port}`);
  });
});
