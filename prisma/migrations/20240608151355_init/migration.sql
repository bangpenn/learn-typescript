-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "address" VARCHAR,
    "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedat" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
