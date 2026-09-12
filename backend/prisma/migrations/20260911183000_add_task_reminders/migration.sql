ALTER TABLE "Task" ADD COLUMN "dueAt" DATETIME;
ALTER TABLE "Task" ADD COLUMN "reminderAt" DATETIME;
CREATE INDEX "Task_userId_reminderAt_idx" ON "Task"("userId", "reminderAt");
