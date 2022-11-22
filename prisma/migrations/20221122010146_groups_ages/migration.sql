-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Draw" (
    "year" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "drawn" BOOLEAN NOT NULL DEFAULT false,
    "ages" TEXT NOT NULL DEFAULT '6,10,14,18',
    "groups" TEXT NOT NULL DEFAULT '6,10,14,18'
);
INSERT INTO "new_Draw" ("drawn", "year") SELECT "drawn", "year" FROM "Draw";
DROP TABLE "Draw";
ALTER TABLE "new_Draw" RENAME TO "Draw";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
