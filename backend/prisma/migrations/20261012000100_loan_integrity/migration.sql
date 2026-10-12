-- A reviewed application creates one loan, and each loan has one row per tranche.
CREATE UNIQUE INDEX "BorrowerLoan_applicationId_key" ON "BorrowerLoan"("applicationId");
CREATE UNIQUE INDEX "Disbursement_loanId_trancheNumber_key" ON "Disbursement"("loanId", "trancheNumber");
