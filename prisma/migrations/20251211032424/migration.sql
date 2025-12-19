-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "SystemUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "SystemUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Assignment" ("assignedAt", "assignedById", "endTime", "id", "notes", "startTime", "status", "technicianId", "ticketId", "updatedAt") SELECT "assignedAt", "assignedById", "endTime", "id", "notes", "startTime", "status", "technicianId", "ticketId", "updatedAt" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
CREATE UNIQUE INDEX "Assignment_ticketId_key" ON "Assignment"("ticketId");
CREATE INDEX "Assignment_assignedById_idx" ON "Assignment"("assignedById");
CREATE INDEX "Assignment_technicianId_idx" ON "Assignment"("technicianId");
CREATE TABLE "new_RepairLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',
    "timeSpent" INTEGER NOT NULL,
    "attachments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepairLog_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RepairLog_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "SystemUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RepairLog" ("action", "assignmentId", "attachments", "createdAt", "description", "id", "status", "technicianId", "timeSpent") SELECT "action", "assignmentId", "attachments", "createdAt", "description", "id", "status", "technicianId", "timeSpent" FROM "RepairLog";
DROP TABLE "RepairLog";
ALTER TABLE "new_RepairLog" RENAME TO "RepairLog";
CREATE INDEX "RepairLog_assignmentId_idx" ON "RepairLog"("assignmentId");
CREATE INDEX "RepairLog_technicianId_idx" ON "RepairLog"("technicianId");
CREATE TABLE "new_TechnicianProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TechnicianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SystemUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TechnicianProfile" ("area", "expertise", "id", "rating", "shift", "totalTasks", "userId") SELECT "area", "expertise", "id", "rating", "shift", "totalTasks", "userId" FROM "TechnicianProfile";
DROP TABLE "TechnicianProfile";
ALTER TABLE "new_TechnicianProfile" RENAME TO "TechnicianProfile";
CREATE UNIQUE INDEX "TechnicianProfile_userId_key" ON "TechnicianProfile"("userId");
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reporterId" TEXT NOT NULL,
    "attachments" TEXT,
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    "notes" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "assetCode" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'NORMAL',
    "resolutionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "Ticket_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "SystemUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("actualTime", "assetCode", "attachments", "category", "completedAt", "contactPerson", "contactPhone", "createdAt", "description", "estimatedTime", "id", "location", "notes", "priority", "reporterId", "resolutionNotes", "severity", "status", "subject", "ticketNumber", "updatedAt") SELECT "actualTime", "assetCode", "attachments", "category", "completedAt", "contactPerson", "contactPhone", "createdAt", "description", "estimatedTime", "id", "location", "notes", "priority", "reporterId", "resolutionNotes", "severity", "status", "subject", "ticketNumber", "updatedAt" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");
CREATE INDEX "Ticket_reporterId_fkey" ON "Ticket"("reporterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
