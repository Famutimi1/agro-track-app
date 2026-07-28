-- Enforce one loan per application (nullable applicationId allows multiple NULLs in Postgres)
CREATE UNIQUE INDEX "BorrowerLoan_applicationId_key" ON "BorrowerLoan"("applicationId");
