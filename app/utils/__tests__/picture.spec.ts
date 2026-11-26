// @vitest-environment node
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { NodeOnDiskFile } from "@remix-run/node";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { createPictureUploadHandler } from "../picture.server";

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "advent-picture-"));
  vi.stubEnv("UPLOADS_DIR", directory);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

async function upload(filename: string, content: string, personId?: string) {
  const file = await createPictureUploadHandler(personId)({
    name: "picture",
    filename,
    contentType: "image/png",
    data: (async function* () {
      yield Buffer.from(content);
    })(),
  });
  expect(file).toBeInstanceOf(NodeOnDiskFile);
  if (!(file instanceof NodeOnDiskFile)) {
    throw new Error("Expected an uploaded file");
  }
  return file;
}

const uuid =
  "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

test("replacements keep the person ID but create distinct filenames and preserve old contents", async () => {
  const first = await upload("portrait.png", "first photo", "person123");
  const second = await upload("portrait.png", "second photo", "person123");

  expect(first.name).toMatch(new RegExp(`^person123-${uuid}\\.png$`));
  expect(second.name).toMatch(new RegExp(`^person123-${uuid}\\.png$`));
  expect(second.name).not.toBe(first.name);
  expect(await readFile(join(directory, first.name), "utf8")).toBe(
    "first photo",
  );
  expect(await readFile(join(directory, second.name), "utf8")).toBe(
    "second photo",
  );
});

test("registration uploads use UUIDs and preserve only the original extension", async () => {
  const file = await upload("original.portrait.jpeg", "photo");
  expect(file.name).toMatch(new RegExp(`^${uuid}\\.jpeg$`));
  expect(await readFile(join(directory, file.name), "utf8")).toBe("photo");
});

test("uploads without an extension still use a UUID", async () => {
  const file = await upload("portrait", "photo", "person123");
  expect(file.name).toMatch(new RegExp(`^person123-${uuid}$`));
});

test("the existing 5 MB upload limit is preserved", async () => {
  await expect(upload("portrait.png", "x".repeat(5_000_001))).rejects.toThrow(
    'Field "picture" exceeded upload size of 5000000 bytes.',
  );
});
