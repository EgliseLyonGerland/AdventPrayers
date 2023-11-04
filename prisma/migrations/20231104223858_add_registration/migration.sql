-- CreateTable
CREATE TABLE "Registration" (
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
    CONSTRAINT "Registration_drawYear_fkey" FOREIGN KEY ("drawYear") REFERENCES "Draw" ("year") ON DELETE RESTRICT ON UPDATE CASCADE
);
