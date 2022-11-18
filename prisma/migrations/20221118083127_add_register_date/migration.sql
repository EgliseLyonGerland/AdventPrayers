-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "drawYear" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "assignedId" TEXT,
    "age" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("drawYear", "personId"),
    CONSTRAINT "Player_drawYear_fkey" FOREIGN KEY ("drawYear") REFERENCES "Draw" ("year") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Player_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Player_assignedId_fkey" FOREIGN KEY ("assignedId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Player" ("age", "assignedId", "drawYear", "personId") SELECT "age", "assignedId", "drawYear", "personId" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
