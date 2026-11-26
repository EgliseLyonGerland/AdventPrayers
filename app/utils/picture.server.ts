import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { unstable_createFileUploadHandler } from "@remix-run/node";

export function createPictureUploadHandler(personId?: string) {
  return unstable_createFileUploadHandler({
    directory: process.env.UPLOADS_DIR || "public/uploads",
    maxPartSize: 5_000_000,
    file: ({ filename }) =>
      `${personId ? `${personId}-` : ""}${randomUUID()}${extname(filename)}`,
  });
}
