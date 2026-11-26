/* eslint-env node */
require("@remix-run/node/install");
const { createRequestHandler } = require("@remix-run/express");
const { installGlobals } = require("@remix-run/node");
const compression = require("compression");
const express = require("express");
const morgan = require("morgan");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
installGlobals();

const build = require("./build/index.js");
const app = express();

app.disable("x-powered-by");
app.use(compression());
app.use(
  "/uploads",
  express.static(process.env.UPLOADS_DIR || "public/uploads", {
    fallthrough: false,
    setHeaders(res) {
      res.setHeader("Cache-Control", "private, max-age=86400");
    },
  }),
);
app.use(
  build.publicPath,
  express.static(build.assetsBuildDirectory, {
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

const server = app.listen(port, process.env.HOST, () => {
  console.log(`Server listening on port ${server.address().port}`);
});

["SIGTERM", "SIGINT"].forEach((signal) => {
  process.once(signal, () => server.close(console.error));
});
