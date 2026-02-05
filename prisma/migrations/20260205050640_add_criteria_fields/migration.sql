-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StepExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "criteriaPassed" BOOLEAN NOT NULL DEFAULT false,
    "criteriaReason" TEXT,
    "tokensUsed" INTEGER,
    "cost" REAL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "error" TEXT,
    CONSTRAINT "StepExecution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StepExecution_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StepExecution" ("attempts", "completedAt", "cost", "error", "executionId", "id", "order", "passed", "prompt", "response", "startedAt", "status", "stepId", "tokensUsed") SELECT "attempts", "completedAt", "cost", "error", "executionId", "id", "order", "passed", "prompt", "response", "startedAt", "status", "stepId", "tokensUsed" FROM "StepExecution";
DROP TABLE "StepExecution";
ALTER TABLE "new_StepExecution" RENAME TO "StepExecution";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
