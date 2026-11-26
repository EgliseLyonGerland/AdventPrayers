/* eslint-env node */
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtemp, rm, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");
const { after, before, test } = require("node:test");

let directory;
let server;
let baseUrl;

before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "advent-uploads-"));
  await writeFile(path.join(directory, "photo.png"), "photo");
  server = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      BASE_URL: "http://localhost",
      HOST: "127.0.0.1",
      PORT: "0",
      UPLOADS_DIR: directory,
    },
    stdio: ["ignore", "pipe", "inherit"],
  });
  const [output] = await Promise.race([
    once(server.stdout, "data"),
    once(server, "exit").then(([code]) => {
      throw new Error(`Server exited before starting: ${code}`);
    }),
  ]);
  const match = output.toString().match(/Server listening on port (\d+)/);
  assert.ok(match, `Unexpected server output: ${output}`);
  baseUrl = `http://127.0.0.1:${match[1]}`;
});

after(async () => {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await once(server, "exit");
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("uploaded photos are cached privately and support conditional and range requests", async () => {
  const response = await fetch(`${baseUrl}/uploads/photo.png`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, max-age=86400");
  assert.equal(await response.text(), "photo");

  const etag = response.headers.get("etag");
  assert.ok(etag);
  const conditional = await fetch(`${baseUrl}/uploads/photo.png`, {
    cache: "force-cache",
    headers: { "If-None-Match": etag },
  });
  assert.equal(conditional.status, 304);
  assert.equal(
    conditional.headers.get("cache-control"),
    "private, max-age=86400",
  );

  const head = await fetch(`${baseUrl}/uploads/photo.png`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("cache-control"), "private, max-age=86400");

  const range = await fetch(`${baseUrl}/uploads/photo.png`, {
    headers: { Range: "bytes=0-1" },
  });
  assert.equal(range.status, 206);
  assert.equal(await range.text(), "ph");
});

test("missing uploads are not cached and other static files retain their policy", async () => {
  const missing = await fetch(`${baseUrl}/uploads/missing.png`);
  assert.equal(missing.status, 404);
  assert.notEqual(
    missing.headers.get("cache-control"),
    "private, max-age=86400",
  );

  const favicon = await fetch(`${baseUrl}/favicon.ico`);
  assert.equal(favicon.status, 200);
  assert.equal(favicon.headers.get("cache-control"), "public, max-age=3600");
});

test("Remix pages and fingerprinted assets remain accessible", async () => {
  const page = await fetch(`${baseUrl}/unregister/ok`);
  assert.equal(page.status, 200);
  assert.notEqual(page.headers.get("cache-control"), "private, max-age=86400");
  const html = await page.text();
  assert.match(html, /Reviens quand tu veux/);

  const assetPath = html.match(/\/build\/[^"]+\.js/)?.[0];
  assert.ok(assetPath);
  const asset = await fetch(`${baseUrl}${assetPath}`);
  assert.equal(asset.status, 200);
  assert.equal(
    asset.headers.get("cache-control"),
    "public, max-age=31536000, immutable",
  );
});
