/*
  Warnings:

  - You are about to drop the column `slug` on the `Person` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT,
    "age" TEXT NOT NULL DEFAULT '18+',
    "bio" TEXT,
    "picture" TEXT
);
INSERT INTO "new_Person" ("age", "bio", "email", "firstName", "gender", "id", "lastName", "picture") SELECT "age", "bio", "email", "firstName", "gender", "id", "lastName", "picture" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
