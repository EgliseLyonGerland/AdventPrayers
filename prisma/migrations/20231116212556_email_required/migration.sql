/*
  Warnings:

  - Made the column `email` on table `Person` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "age" TEXT NOT NULL DEFAULT '18+',
    "bio" TEXT,
    "picture" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Person" ("age", "bio", "createdAt", "email", "firstName", "gender", "id", "lastName", "picture", "updatedAt") SELECT "age", "bio", "createdAt", "email", "firstName", "gender", "id", "lastName", "picture", "updatedAt" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
