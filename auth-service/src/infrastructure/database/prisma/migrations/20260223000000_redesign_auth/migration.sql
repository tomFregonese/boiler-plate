-- Migration: redesign auth schema
-- Drop old tables
DROP TABLE IF EXISTS "users" CASCADE;

-- Create new users table
CREATE TABLE "users" (
    "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
    "login"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "roles"     TEXT[] NOT NULL DEFAULT ARRAY['ROLE_USER'],
    "status"    TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- Create refresh_tokens table
CREATE TABLE "refresh_tokens" (
    "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
    "token"     TEXT NOT NULL,
    "userId"    UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

