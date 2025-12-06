-- CreateTable
CREATE TABLE "CoupleSpace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passphraseHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "avatarEmoji" TEXT NOT NULL DEFAULT '💕',
    "coupleSpaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Moment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'none',
    "userId" TEXT NOT NULL,
    "coupleSpaceId" TEXT NOT NULL,
    "momentDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Moment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Moment_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CoupleSpace_passphraseHash_key" ON "CoupleSpace"("passphraseHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_coupleSpaceId_nickname_key" ON "User"("coupleSpaceId", "nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Moment_userId_momentDate_key" ON "Moment"("userId", "momentDate");
