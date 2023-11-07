-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drawYear" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT,
    "age" TEXT NOT NULL DEFAULT '18+',
    "bio" TEXT,
    "picture" TEXT,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "personId" TEXT,
    CONSTRAINT "Registration_drawYear_fkey" FOREIGN KEY ("drawYear") REFERENCES "Draw" ("year") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Registration" ("age", "bio", "drawYear", "email", "firstName", "gender", "id", "lastName", "picture", "registeredAt") SELECT "age", "bio", "drawYear", "email", "firstName", "gender", "id", "lastName", "picture", "registeredAt" FROM "Registration";
DROP TABLE "Registration";
ALTER TABLE "new_Registration" RENAME TO "Registration";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
