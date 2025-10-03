/*
  Warnings:

  - You are about to drop the column `stack_user_id` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_stack_user_id_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "stack_user_id";
