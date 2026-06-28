-- CreateTable
CREATE TABLE "public"."RevokedRefreshToken" (
    "id_revoked_refresh_token" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedRefreshToken_pkey" PRIMARY KEY ("id_revoked_refresh_token")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevokedRefreshToken_tokenHash_key" ON "public"."RevokedRefreshToken"("tokenHash");
